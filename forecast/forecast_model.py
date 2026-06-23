"""
Treasure cash flow forecast.

This builds the 90 day forecast that the app shows on the dashboard.

The idea is that a small business has two kinds of cash flow:
  1. Stuff we already know from the accounting system (wages, supplier bills, the oven
     repair). We just put these in directly, no guessing needed.
  2. Daily sales, which we do not know yet. We predict these with a gradient boosting
     model. We actually train three of them, for the low, middle and high case, which is
     how we get a confidence band out of gradient boosting.

Then we run a quick Monte Carlo (lots of random sample paths) to get the band around the
running balance. The band gets wider further into the future, which makes sense because we
are less sure the further ahead we look.

It saves everything to src/data/forecast.json, which the website reads.

To run it:  py forecast/forecast_model.py
"""

import json
from datetime import date, timedelta
from pathlib import Path

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor

RNG = np.random.default_rng(42)

START = date(2025, 11, 15)        # the day we forecast from
START_BALANCE = 14_200            # money in the bank right now, in euros
HORIZON = 90
REV_DAYS = list(range(7, 91, 7))  # sales come in once a week (day 7, 14, ...)
REV_DAYS.append(90)

# Things we already know are coming, from the accounting system (day -> euros).
# Wages, supplier bills, utilities, and the big one-off oven repair.
SCHEDULED = {
    3: -4800, 10: -3200, 13: -1800, 17: -4600, 24: -3200, 29: -2400, 30: -3200,
    31: -18000,  # the oven breaks, this is what causes the cash gap
    33: -1800, 45: -3200, 57: -3200, 65: -4500, 71: -3200, 85: -3200,
}
OVEN_DAY = 31


# Small helpers. features() turns a date into a few numbers the model can read,
# and true_weekly_revenue() is a rough sales curve we use to make fake history.
def features(d: date) -> list[float]:
    doy = d.timetuple().tm_yday
    trend = (d.toordinal() - START.toordinal()) / 30.0
    return [trend, np.sin(2 * np.pi * doy / 365), np.cos(2 * np.pi * doy / 365)]


def true_weekly_revenue(d: date) -> float:
    base = 4700 + 4.0 * (d.toordinal() - START.toordinal()) / 7.0  # sales rise a bit over time
    dd = abs((d - date(d.year, 12, 22)).days)                       # how close to christmas
    christmas = 1500 * np.exp(-((dd / 12.0) ** 2))                  # busier around christmas
    return base + christmas


# Make a year of fake weekly sales history and train the three models on it.
NOISE_SIGMA = 600
hist_dates = [START - timedelta(days=7 * k) for k in range(1, 53)]  # 52 past weeks
X_hist = np.array([features(d) for d in hist_dates])
y_hist = np.array([true_weekly_revenue(d) + RNG.normal(0, NOISE_SIGMA) for d in hist_dates])

models = {}
for alpha in (0.1, 0.5, 0.9):
    gbr = GradientBoostingRegressor(
        loss="quantile", alpha=alpha, n_estimators=300,
        max_depth=2, learning_rate=0.05, subsample=0.9, random_state=42,
    )
    gbr.fit(X_hist, y_hist)
    models[alpha] = gbr

# How far off the middle model is on the training data. We reuse these errors below.
resid = y_hist - models[0.5].predict(X_hist)


# Predict next quarter's sales, then simulate the bank balance day by day.
future_dates = {d: START + timedelta(days=d) for d in REV_DAYS}
X_future = np.array([features(future_dates[d]) for d in REV_DAYS])
rev_p50 = dict(zip(REV_DAYS, models[0.5].predict(X_future)))


def simulate(include_oven: bool, n_paths: int = 800) -> list[dict]:
    """Run lots of random paths and read off the low, middle and high balance per day."""
    paths = np.zeros((n_paths, HORIZON + 1))
    for s in range(n_paths):
        bal = float(START_BALANCE)
        for day in range(1, HORIZON + 1):
            flow = SCHEDULED.get(day, 0)
            if include_oven is False and day == OVEN_DAY:
                flow -= SCHEDULED[OVEN_DAY]  # healthy version: take the oven back out
            if day in rev_p50:
                # this week's sales = the model's guess plus a random past error
                flow += rev_p50[day] + RNG.choice(resid)
            bal += flow
            paths[s, day] = bal
    out = []
    for day in range(1, HORIZON + 1):
        col = paths[:, day]
        dt = START + timedelta(days=day)
        out.append({
            "day": day,
            "date": f"{dt.strftime('%b')} {dt.day}",
            "balance": round(float(np.percentile(col, 50))),
            "lower": round(float(np.percentile(col, 10))),
            "upper": round(float(np.percentile(col, 90))),
        })
    return out


points = simulate(include_oven=True)
healthy = simulate(include_oven=False)

avg_monthly_revenue = round(sum(rev_p50.values()) / (HORIZON / 30.4))
trough = min(points, key=lambda p: p["balance"])
gap = next((p for p in points if p["balance"] < 0), None)

payload = {
    "model": "gradient-boosting quantile regression (scikit-learn) + Monte-Carlo bands",
    "generatedBy": "forecast/forecast_model.py",
    "horizonDays": HORIZON,
    "startDate": START.isoformat(),
    "metrics": {
        "currentBalance": START_BALANCE,
        "avgMonthlyRevenue": avg_monthly_revenue,
        "gapDate": gap["date"] if gap else None,
        "gapBalance": gap["balance"] if gap else None,
        "troughDate": trough["date"],
        "troughBalance": trough["balance"],
    },
    "points": points,
    "healthyPoints": healthy,
}

out_path = Path(__file__).resolve().parent.parent / "src" / "data" / "forecast.json"
out_path.parent.mkdir(parents=True, exist_ok=True)
out_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

print(f"wrote {out_path}")
print(f"avg monthly revenue : EUR {avg_monthly_revenue:,}")
print(f"gap                 : {gap['date'] if gap else 'none'} @ EUR {gap['balance'] if gap else '-'}")
print(f"trough              : {trough['date']} @ EUR {trough['balance']:,}")
print(f"band width @ day 90  : EUR {points[-1]['upper'] - points[-1]['lower']:,}")

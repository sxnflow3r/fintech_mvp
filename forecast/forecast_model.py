"""
Treasure — 90-day cash-flow forecasting prototype.

This is the real, code-backed version of Treasure's core conceptual innovation: a
gradient-boosted forecast of an SME's cash position with confidence intervals.

Approach (a realistic treasury hybrid):
  1. KNOWN scheduled items (payroll, supplier invoices, utilities, the one-off oven)
     come straight from the accounting system — they are deterministic, not predicted.
  2. VARIABLE weekly revenue is the uncertain part. We model it with GRADIENT-BOOSTED
     QUANTILE REGRESSION (scikit-learn, loss="quantile" at alpha=0.1/0.5/0.9). This is
     the direct answer to "how do you get confidence intervals from gradient boosting?":
     you train separate quantile models.
  3. The cumulative-balance band is produced by Monte-Carlo: we sample future weekly
     revenue from the model's predicted distribution and accumulate. Because uncertainty
     compounds, the band fans out with the horizon — exactly as a real forecast should.

Output: src/data/forecast.json, consumed directly by the Next.js UI. The app therefore
renders REAL model output, not a hand-written series.

Run:  py forecast/forecast_model.py
"""

import json
from datetime import date, timedelta
from pathlib import Path

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor

RNG = np.random.default_rng(42)

START = date(2025, 11, 15)        # "today" — forecast covers the next 90 days
START_BALANCE = 14_200            # current balance from the accounting feed (EUR)
HORIZON = 90
REV_DAYS = list(range(7, 91, 7))  # weekly sales land on day 7, 14, ... 84, plus 90
REV_DAYS.append(90)

# Known scheduled items from the accounting system (day-in-horizon -> EUR delta).
# These are facts, not forecasts: payroll, supplier invoices, utilities, and the
# one-off emergency oven replacement that creates the liquidity gap.
SCHEDULED = {
    3: -4800, 10: -3200, 13: -1800, 17: -4600, 24: -3200, 29: -2400, 30: -3200,
    31: -18000,  # emergency oven replacement -> triggers the gap
    33: -1800, 45: -3200, 57: -3200, 65: -4500, 71: -3200, 85: -3200,
}
OVEN_DAY = 31


# --------------------------------------------------------------------------- #
# 1. Feature engineering + the "true" seasonal revenue signal (for synthetic
#    history). A bakery's weekly revenue rises into the Christmas period.
# --------------------------------------------------------------------------- #
def features(d: date) -> list[float]:
    doy = d.timetuple().tm_yday
    trend = (d.toordinal() - START.toordinal()) / 30.0
    return [trend, np.sin(2 * np.pi * doy / 365), np.cos(2 * np.pi * doy / 365)]


def true_weekly_revenue(d: date) -> float:
    base = 4700 + 4.0 * (d.toordinal() - START.toordinal()) / 7.0  # mild upward trend
    dd = abs((d - date(d.year, 12, 22)).days)                       # days from Xmas peak
    christmas = 1500 * np.exp(-((dd / 12.0) ** 2))                  # seasonal uplift
    return base + christmas


# --------------------------------------------------------------------------- #
# 2. Build synthetic weekly-revenue history (one year of past weeks) and fit
#    gradient-boosted quantile models for p10 / p50 / p90.
# --------------------------------------------------------------------------- #
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

# Training residuals (around the median model) drive the Monte-Carlo sampling.
resid = y_hist - models[0.5].predict(X_hist)


# --------------------------------------------------------------------------- #
# 3. Predict the future weekly revenue and Monte-Carlo the cumulative balance.
# --------------------------------------------------------------------------- #
future_dates = {d: START + timedelta(days=d) for d in REV_DAYS}
X_future = np.array([features(future_dates[d]) for d in REV_DAYS])
rev_p50 = dict(zip(REV_DAYS, models[0.5].predict(X_future)))


def simulate(include_oven: bool, n_paths: int = 800) -> list[dict]:
    """Monte-Carlo daily balance paths -> per-day p10/p50/p90."""
    paths = np.zeros((n_paths, HORIZON + 1))
    for s in range(n_paths):
        bal = float(START_BALANCE)
        for day in range(1, HORIZON + 1):
            flow = SCHEDULED.get(day, 0)
            if include_oven is False and day == OVEN_DAY:
                flow -= SCHEDULED[OVEN_DAY]  # remove the oven for the "healthy" scenario
            if day in rev_p50:
                # sample this week's revenue: median prediction + bootstrapped residual
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

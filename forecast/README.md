# Treasure — Forecasting Prototype

This folder contains the **real, code-backed forecasting model** behind Treasure's core
innovation. The Next.js app renders its output (`src/data/forecast.json`) directly, so the
dashboard chart is genuine model output — not a hand-written series.

## What it does

`forecast_model.py` produces a 90-day cash-position forecast for the demo SME (the bakery
"De Gouden Korst") with an **80% confidence band**, using a realistic treasury split:

1. **Known scheduled items** (payroll, supplier invoices, utilities, the one-off oven
   replacement) come from the accounting system — they are deterministic, not predicted.
2. **Variable weekly revenue** is the uncertain part. It is modelled with **gradient-boosted
   quantile regression** (`scikit-learn` `GradientBoostingRegressor`, `loss="quantile"` at
   α = 0.1 / 0.5 / 0.9). Training separate quantile models is *how you get confidence
   intervals out of gradient boosting* — the direct answer to that question.
3. The **cumulative-balance band** is produced by **Monte-Carlo**: future weekly revenue is
   sampled from the model's predicted distribution and accumulated over 800 paths, then we
   read off the daily p10 / p50 / p90. Because uncertainty compounds, the band **fans out
   with the horizon** — as a real forecast should.

Two scenarios are emitted: `points` (the gap month, with the oven shock) and
`healthyPoints` (the same month without the shock), so the UI can demonstrate both states.

## Why gradient boosting (and its limits)

GB handles the tabular, calendar-driven structure of SME cash flow well (day/week/month
seasonality, trend, the Christmas uplift) and gives quantiles cheaply. Its weakness is
**regime change** — a lost key client or a price shock breaks the learned pattern — which is
why the band is wide and why known one-offs are handled deterministically rather than
predicted. In production this becomes a global base model + per-SME personalisation.

## Run it

```bash
py forecast/forecast_model.py      # Windows (py launcher)
# or:  python forecast/forecast_model.py
```

Dependencies: `pip install -r forecast/requirements.txt` (numpy, scikit-learn).
The script rewrites `src/data/forecast.json`, which the app imports at build time.

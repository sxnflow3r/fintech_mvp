# Treasure

**Cash flow operating system for European small and medium enterprises**

> MVP demo — BM26BAM FinTech: Business Models and Applications
> Rotterdam School of Management, Erasmus University

---

## What it does

Treasure connects to an SME's **cloud accounting software** — which already holds their reconciled bank-feed data — to produce a continuously updated **90-day cash flow forecast**. When the forecast detects a future liquidity gap, the platform automatically pre-qualifies the SME and runs an instant auction across lender partners, delivering ranked, binding financing offers in under a minute.

The SME accepts the best offer in one click. No paperwork. Funds arrive next business day.

> **On PSD2:** the accounting connection is the MVP's single data source, because the accounting platform already ingests the SME's bank transactions. Direct **PSD2 / AISP open-banking connectivity is a phase-2 layer** — for real-time data and for accounts the accounting software doesn't capture. See *Integration strategy* below.

---

## The three-screen demo flow

| Screen | What it shows |
|---|---|
| **1. Connect** | Simulated OAuth connection to Exact Online, with supported-platform coverage |
| **2. Dashboard** | 90-day forecast chart, KPI cards, gap detection, and a before/after financing view |
| **3. Marketplace** | Three ranked lender offers with APR — one-click accept |

---

## Tech stack

- **Next.js 15** (App Router, TypeScript) — frontend
- **Python** (scikit-learn) — the forecasting model, run offline (see *Forecasting model*)
- **Tailwind CSS** — dark design system, brand teal `#20cbb8` on navy `#0a192c`
- **Custom SVG chart** — hand-rolled forecast chart with animated draw, confidence band, and gap shading (no charting dependency)
- **Lucide React** — icons

The Next.js app has no runtime backend. The forecast is generated offline by the Python model and shipped as JSON (`src/data/forecast.json`); SME profile and lender offers live in `src/lib/mockData.ts`.

---

## Architecture

```
forecast/
├── forecast_model.py     # Python forecasting model (gradient-boosted quantile regression)
├── requirements.txt      # Python dependencies
└── README.md             # Model write-up
src/
├── app/
│   ├── layout.tsx        # Root layout, metadata
│   ├── page.tsx          # Screen state machine
│   └── globals.css       # Brand tokens + animations
├── components/
│   ├── ConnectScreen.tsx     # Step 1: accounting integration simulation
│   ├── DashboardScreen.tsx   # Step 2: forecast + gap detection
│   ├── CashFlowChart.tsx     # Custom SVG forecast chart
│   └── MarketplaceScreen.tsx # Step 3: ranked lender offers
├── data/
│   └── forecast.json     # Model output consumed by the chart
└── lib/
    └── mockData.ts       # SME profile, lender offers
```

---

## How to run

```
git clone https://github.com/sxnflow3r/fintech_mvp
cd fintech_mvp
npm install
npm run dev
```

Open http://localhost:3000.

**Demo walkthrough:**
1. Connect Exact Online
2. Click "View your forecast" and watch the 90-day chart animate
3. When the gap alert appears, click "View offers"
4. Compare the three lender offers and click "Accept"

**Regenerate the forecast** (optional): `python forecast/forecast_model.py` (dependencies in `forecast/requirements.txt`).

---

## Deployment

Vercel (recommended): connect the GitHub repo in the Vercel dashboard — zero configuration required.

```
npx vercel --prod
```

---

## Forecasting model

The forecasting engine is the core of Treasure's conceptual innovation, and it is **real code, not a mock**. The dashboard chart renders the output of a Python model (`forecast/forecast_model.py` → `src/data/forecast.json`). See [`forecast/README.md`](forecast/README.md) for the full write-up.

**Approach:** a realistic treasury split. *Known* scheduled items (payroll, invoices, the one-off oven replacement) are deterministic from the accounting feed, while the *uncertain* weekly revenue is modelled with **gradient-boosted quantile regression** (scikit-learn, `loss="quantile"` at α = 0.1 / 0.5 / 0.9) — that is how the confidence intervals come out of gradient boosting. The cumulative-balance band is then produced by **Monte-Carlo** so it widens with the horizon. Two scenarios are emitted (gap month + healthy month) and the UI can switch between them.

**Why gradient boosting, and its limit:** strong for the calendar-driven, seasonal structure of SME cash flow; weak under regime change (e.g. a lost client), which is why one-off events are handled deterministically and the band is kept wide.

**Path to production — a hybrid, not one model or many:**
- A **global base model** across the whole customer base learns general SME cash-flow structure (payroll cycles, VAT quarters, seasonality). This is also the data moat: every SME added improves predictions for everyone.
- A **per-SME personalisation layer** tunes to each business's own patterns.
- **Industry is a model input**, with sector-level priors so a new customer gets sensible forecasts on day one (solving the cold-start problem).

**Data cadence:** because the horizon is 90 days, **daily refresh is sufficient** — real-time data would not materially change a quarter-ahead projection. This is why the MVP relies on the accounting feed rather than direct PSD2 connectivity.

---

## Integration strategy

For the launch market (Netherlands / Benelux), the anchor integration is **Exact Online**, the regional market leader. The Dutch accounting market is fragmented across ~14 tools, so rather than build each integration separately, the production design uses a **unified accounting API aggregator** (e.g. Chift, Apideck, Maesn) — integrate once, connect to Exact, AFAS, Visma/Yuki, Moneybird, SnelStart, Twinfield and more. This mitigates the "partnership concentration" risk in the business plan and lets a small team cover a fragmented market.

Integration uses each platform's **OAuth 2.0 + REST API**: the SME authorises read-only access on the provider's own consent screen (no credentials shared with Treasure), after which invoices, payables, and reconciled bank transactions are pulled. Because the accounting platform already ingests bank-feed data, a single accounting connection covers both invoices and bank transactions for the MVP. **Direct PSD2 / AISP connectivity is a phase-2 enhancement.**

---

## Scaling prerequisites

To move from MVP demo to production:

1. Unified accounting API integration (Exact Online first, then AFAS, Visma, Moneybird via aggregator)
2. Forecasting model trained on real transaction history (see *Forecasting model*)
3. Lender API contracts for real-time offer generation
4. Authentication (NextAuth or Clerk)
5. Database (Postgres / Supabase)
6. PSD2 aggregator + AISP licence from De Nederlandsche Bank (phase 2 — direct bank connectivity)

---

## Security considerations

| Risk | Mitigation |
|---|---|
| Accounting OAuth token exposure | Tokens stored server-side only; read-only scopes |
| Lender data leakage | Each lender receives only pre-agreed data fields |
| Forecast manipulation | Model outputs validated server-side |
| SME impersonation | Authorisation via the provider's own OAuth consent screen |

---

## AI agent usage

This MVP was built using **Claude Code** as the primary coding agent.

**Why Claude Code:** native terminal integration, strong Next.js App Router understanding, and the ability to reason about the full business plan context so design choices (Dutch bakery, Exact Online, realistic APRs) match the Treasure narrative.

**Orchestration:** mock-data-first, then the real forecasting model. Components were scaffolded one screen at a time, with the shared data layer designed before the UI. Agent constraints are codified in `CLAUDE.md` and `.claude/`.

---

## Team

Jamie Fox (714797) & Victor Barbou (653199)
BM26BAM FinTech — Rotterdam School of Management, Erasmus University

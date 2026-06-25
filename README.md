# Treasure

**Cash flow operating system for European small and medium enterprises**

> MVP demo — BM26BAM FinTech: Business Models and Applications  
> Rotterdam School of Management, Erasmus University

---

## What it does

Treasure connects to the SME's **cloud accounting software** — which already holds their reconciled bank-feed data — to produce a continuously updated **90-day cash flow (liquidity) forecast**. When the forecast detects a future liquidity gap, the platform automatically pre-qualifies the SME and runs an instant auction across lender partners — delivering ranked, binding financing offers in under a minute.

The SME accepts the best offer with a single click. No additional paperwork. Funds arrive next business day.

> **On PSD2:** the accounting connection is the MVP's single data source, because the
> accounting platform already ingests the SME's bank transactions. Direct **PSD2 / AISP
> open-banking connectivity is a phase-2 layer** (real-time data + accounts the accounting
> software doesn't capture). The demo's "Connect bank" step illustrates that phase-2 layer.
> See *Integration strategy* below.

---

## The three-screen demo flow

| Screen | What it shows |
|---|---|
| **1. Connect** | Simulated connection to Exact Online |
| **2. Dashboard** | Animated 90-day forecast chart, KPI cards, gap detection alert |
| **3. Marketplace** | Three ranked lender offers with APR — one-click accept |

---

## Tech stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** dark design system — brand teal `#20cbb8` on navy `#0a192c`
- **Custom SVG chart** — hand-rolled 90-day forecast with animated draw, confidence band, and gap shading (no charting dependency)
- **Lucide React** iconography

No backend. All data is simulated in `src/lib/mockData.ts` using a deterministic cash-flow model based on a Dutch bakery SME ("De Gouden Korst BV").

---

## Architecture

```
src/
├── app/
│   ├── layout.tsx            # Root layout, metadata
│   ├── page.tsx              # Screen state machine
│   └── globals.css           # Brand tokens + animations
├── components/
│   ├── ConnectScreen.tsx     # Step 1: PSD2 + accounting simulation
│   ├── DashboardScreen.tsx   # Step 2: Forecast + gap detection
│   ├── CashFlowChart.tsx     # Custom SVG forecast chart
│   └── MarketplaceScreen.tsx # Step 3: Ranked lender offers
└── lib/
    └── mockData.ts           # SME profile, forecast generator, lender offers
```

---

## How to run

```bash
git clone https://github.com/sxnflow3r/fintech_mvp
cd fintech_mvp
npm install
npm run dev
```

Open http://localhost:3000.

**Demo walkthrough:**
1. Connect ING Business, then connect Exact Online
2. Click "View your forecast" and watch the 90-day chart animate
3. When the red gap alert appears (~day 31), click "View offers"
4. Compare the three lender offers and click "Accept"

---

## Deployment

Vercel (recommended): connect the GitHub repo in the Vercel dashboard — zero configuration required.

```bash
npx vercel --prod
```

---

## AI agent usage

This MVP was built using **Claude Code** as the primary coding agent.

**Why Claude Code:** Native terminal integration, strong Next.js App Router understanding, and the ability to reason about the full business plan context so mock data choices (Dutch bakery, ING Business, Exact Online, realistic APRs) match the Treasure narrative.

**Orchestration strategy:** Mock-data-first. The agent designed `mockData.ts` before any component, ensuring all three screens share a consistent data layer. Components were scaffolded one screen at a time. Agent constraints are codified in `CLAUDE.md` and `.claude/settings.json`.

---

## Forecasting model

The forecasting engine is the core of Treasure's conceptual innovation, and it is **real code**, not a mock. The dashboard chart renders the output of a Python model (`forecast/forecast_model.py` → `src/data/forecast.json`) — see [`forecast/README.md`](forecast/README.md) for the full write-up.

**Approach:** a realistic treasury split — *known* scheduled items (payroll, invoices, the one-off oven) are deterministic from the accounting feed, while the *uncertain* weekly revenue is modelled with **gradient-boosted quantile regression** (`scikit-learn`, `loss="quantile"` at α=0.1/0.5/0.9). That is how the confidence intervals come out of gradient boosting. The cumulative-balance band is then produced by **Monte-Carlo** so it fans out with the horizon. Two scenarios are emitted (gap month + healthy month) and the UI can switch between them.

**Why GB + its limit:** great for the calendar-driven, seasonal structure of SME cash flow; weak under regime change (a lost client), which is why one-offs are handled deterministically and the band is wide. Production evolves this into a global base model + per-SME personalisation.

**Regenerate it:** `py forecast/forecast_model.py` (deps in `forecast/requirements.txt`).

**Architecture — a hybrid, not one model or many:**
- A **global base model** trained across the whole customer base learns general SME cash-flow structure (payroll cycles, VAT quarters, seasonality). This is also the data moat: every SME added improves predictions for everyone.
- A **per-SME personalisation layer** tunes to each business's own patterns.
- **Industry is a model input**, with sector-level priors so a brand-new customer gets sensible forecasts on day one (solving the cold-start problem) before it has much of its own history.

**Data cadence:** because the horizon is 90 days, **daily refresh is sufficient** — real-time data would not materially change a quarter-ahead projection. This is why the MVP relies on the accounting feed rather than requiring direct PSD2 connectivity.

**Timeline:** building a production-grade v1 pipeline is realistically a few months of data-science work (part of the pre-seed scope). Training on a given SME is fast once the pipeline exists; the real constraint is data accumulation, hence the "baseline immediately, sharper within weeks" behaviour.

---

## Integration strategy

For the launch market (Netherlands / Benelux), the anchor integration is **Exact Online**, the regional market leader. The Dutch accounting market is fragmented across ~14 tools, so rather than build each integration separately, the production design uses a **unified accounting API aggregator** (e.g. Chift, Apideck, Maesn) — integrate once, connect to Exact, AFAS, Visma/Yuki, Moneybird, SnelStart, Twinfield and more. This directly mitigates the "partnership concentration" risk in the business plan and lets a small team cover the fragmented market.

Integration uses each platform's **OAuth 2.0 + REST API**: the SME authorises read access on the provider's own consent screen (no credentials shared with Treasure), after which invoices, payables, and reconciled bank transactions are pulled. Because the accounting platform already ingests bank-feed data, a single accounting connection covers both invoices and bank transactions for the MVP — **direct PSD2 / AISP connectivity is a phase-2 enhancement** for real-time data and for SMEs whose accounting software doesn't capture all accounts.

---

## Scaling prerequisites

To move from MVP demo to production:

1. Unified accounting API integration (Exact Online first, then AFAS, Visma, Moneybird via aggregator)
2. ML forecasting model trained on real transaction history (see *Forecasting model* above)
3. Lender API contracts for real-time offer generation
4. Authentication (NextAuth or Clerk)
5. Database (Postgres/Supabase)
6. PSD2 aggregator + AISP licence from De Nederlandsche Bank (phase 2 — direct bank connectivity)

---

## Security considerations

| Risk | Mitigation |
|---|---|
| Open banking token exposure | Tokens stored server-side only |
| Lender data leakage | Each lender receives only pre-agreed data fields |
| Forecast manipulation | Model outputs signed server-side |
| SME impersonation | Strong Customer Authentication at PSD2 consent step |

---

## Team

Jamie Fox (714797) & Victor Barbou (653199)  
BM26BAM FinTech — Rotterdam School of Management, Erasmus University

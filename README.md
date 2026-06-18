# Treasure

**Cash flow operating system for European small and medium enterprises**

> MVP demo — BM26BAM FinTech: Business Models and Applications  
> Rotterdam School of Management, Erasmus University

---

## What it does

Treasure connects an SME's bank account (via PSD2 open banking) and cloud accounting software to produce a continuously updated **90-day cash flow forecast**. When the forecast detects a future liquidity gap, the platform automatically pre-qualifies the SME and runs an instant auction across lender partners — delivering ranked, binding financing offers in under a minute.

The SME accepts the best offer with a single click. No additional paperwork. Funds arrive next business day.

---

## The three-screen demo flow

| Screen | What it shows |
|---|---|
| **1. Connect** | Simulated PSD2 OAuth consent for ING Business + Exact Online |
| **2. Dashboard** | Animated 90-day forecast chart, KPI cards, gap detection alert |
| **3. Marketplace** | Three ranked lender offers with APR — one-click accept |

---

## Tech stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** dark design system
- **Recharts** animated area chart with confidence band
- **Lucide React** iconography

No backend. All data is simulated in `src/lib/mockData.ts` using a deterministic cash-flow model based on a Dutch bakery SME ("De Gouden Korst BV").

---

## Architecture

```
src/
├── app/
│   ├── layout.tsx            # Root layout, metadata
│   ├── page.tsx              # Screen state machine
│   └── globals.css
├── components/
│   ├── ConnectScreen.tsx     # Step 1: PSD2 + accounting simulation
│   ├── DashboardScreen.tsx   # Step 2: Forecast chart + gap detection
│   └── MarketplaceScreen.tsx # Step 3: Ranked lender offers
└── lib/
    └── mockData.ts           # SME profile, forecast generator, lender offers
```

---

## How to run

```bash
git clone https://github.com/your-repo/treasure-mvp
cd treasure-mvp
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

## Scaling prerequisites

To move from MVP demo to production:

1. AISP licence from De Nederlandsche Bank
2. PSD2 aggregator (Salt Edge, Nordigen/GoCardless, Tink)
3. Accounting API integrations (Exact Online, Sage, QuickBooks)
4. ML forecasting model trained on real transaction history
5. Lender API contracts for real-time offer generation
6. Authentication (NextAuth or Clerk)
7. Database (Postgres/Supabase)

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

# AGENTS.md — Agent Instructions for Treasure

Cross-agent instructions (Codex, Cursor, Gemini, Copilot, and any AGENTS.md-aware tool).
Claude Code reads `CLAUDE.md`; this file mirrors the same rules for every other agent.

## Project overview

Treasure is a **Next.js 15/16 (App Router, TypeScript) MVP** for a PSD2-powered cash-flow
("liquidity") operating system for European SMEs. It is a **frontend-only demo** that
simulates the three-stage journey: **connect → forecast → financing marketplace**. There is
no backend; all data is mocked.

## Architecture

```
src/
├── app/           # App Router: layout.tsx, page.tsx (screen state machine), globals.css
├── components/    # ConnectScreen, DashboardScreen, MarketplaceScreen, CashFlowChart (custom SVG)
└── lib/
    └── mockData.ts  # SME profile, deterministic 90-day forecast generator, lender offers
```

## Coding conventions

- TypeScript strict mode. **No `any` types.**
- Tailwind CSS utility classes only — no custom CSS except in `globals.css`.
- Components are single-file, self-contained, kept under ~200 lines.
- Monetary values formatted with `Intl.NumberFormat` (`nl-NL`, EUR).
- React local state only — no external state library at MVP stage.
- Brand palette is fixed: navy `#0a192c`, cards `#0f2236`, teal accent `#20cbb8`.

## What to mock vs. simulate

- PSD2 OAuth: simulate with a 2–3s timed loading state, then "Connected".
- Transactions / forecast: from `src/lib/mockData.ts`, computed **deterministically**
  (no random seeds). Do not fetch external APIs.
- Lender offers: static array in `mockData.ts`, ranked by APR ascending.

## When adding features

1. Add new mock data to `mockData.ts` first, then consume it in components.
2. New screens export a default component and accept `onComplete`/`onBack` props.
3. Wire new screens in `src/app/page.tsx` by extending the `Screen` union type.

## What NOT to do

- No backend or API routes — this is a frontend-only demo.
- No authentication; the connect flow is simulated.
- No `localStorage`/`sessionStorage`.
- Do not change the brand palette.

## Commands

```
npm install
npm run dev    # http://localhost:3000
npm run build  # production build check
npm run lint
```

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version may have breaking changes — APIs, conventions, and file structure may differ
from your training data. Check the installed Next.js version in `package.json` and consult
the matching docs before writing code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

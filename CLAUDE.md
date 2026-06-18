# CLAUDE.md — Agent Instructions for Treasure

This file instructs AI coding agents (Claude Code, Cursor, Copilot) on how to work within this repository.

## Project overview

Treasure is a Next.js 15 MVP for a PSD2-powered cash flow operating system targeting European SMEs.
The app simulates the three-stage user journey: connect → forecast → financing marketplace.

## Architecture

```
src/
├── app/           # Next.js App Router (layout, page, globals.css)
├── components/    # One file per screen: ConnectScreen, DashboardScreen, MarketplaceScreen
└── lib/
    └── mockData.ts  # All mock SME data, forecast generation, lender offers
```

## Coding conventions

- TypeScript strict mode. No `any` types.
- Tailwind CSS utility classes only — no custom CSS except in globals.css.
- Components are single-file, self-contained. Keep each under ~200 lines.
- All monetary values formatted with Intl.NumberFormat (nl-NL locale, EUR).
- React state only — no external state library needed at MVP stage.

## What to mock vs. what to simulate

- PSD2 OAuth: simulate with a timed loading state (2-3 seconds), then "Connected".
- Bank transactions: use the data in src/lib/mockData.ts. Do not fetch external APIs.
- Forecast: computed deterministically from mockData.ts. Do not use random seeds.
- Lender offers: static array in mockData.ts. Ranked by APR ascending.

## When adding features

1. Add new mock data to mockData.ts first, then consume it in components.
2. New screens follow the same pattern: export a default component, accept onComplete/onBack props.
3. Wire new screens in src/app/page.tsx by extending the Screen union type.

## What NOT to do

- Do not introduce a backend or API routes — this is a frontend-only MVP demo.
- Do not add authentication — the connect flow is simulated.
- Do not use localStorage or sessionStorage.
- Do not change the dark color scheme (#0a0f1e base, #111827 cards, #10b981 accent).

## Running the project

npm install
npm run dev   # http://localhost:3000
npm run build # production build check

## Deployment

Vercel (recommended): connect the GitHub repo, zero configuration needed.
Netlify: npm run build, output dir is .next.

// Treasure data layer.
//
// The forecast is now REAL model output: `forecast.json` is produced by the
// gradient-boosting quantile model in `forecast/forecast_model.py`. The UI renders
// that file directly — it is no longer a hand-written series. Gap detection, lender
// economics, and the financed scenario are all computed here in code.

import forecast from "@/data/forecast.json";

export const SME_PROFILE = {
  name: "De Gouden Korst BV",
  owner: "Maria van den Berg",
  sector: "Food & Beverage – Artisan Bakery",
  location: "Rotterdam, Netherlands",
  accountingConnected: "Exact Online",
  // currentBalance + avgMonthlyRevenue come from the model output, so the KPIs can
  // never contradict the forecast behind them.
  currentBalance: forecast.metrics.currentBalance,
};

export const AVG_MONTHLY_REVENUE = forecast.metrics.avgMonthlyRevenue;
export const FORECAST_MODEL = forecast.model;

export type ForecastPoint = {
  day: number;
  date: string;
  balance: number;
  lower: number;
  upper: number;
};

export const FORECAST_DATA: ForecastPoint[] = forecast.points;
export const HEALTHY_DATA: ForecastPoint[] = forecast.healthyPoints;

// --- Gap detection (real, configurable threshold) ----------------------------
export type GapInfo = {
  breachIndex: number;
  breachDay: ForecastPoint | null;
  trough: ForecastPoint;
};

/** Scan the projected series for the first point below `threshold`, plus the trough. */
export function detectGap(series: ForecastPoint[], threshold = 0): GapInfo {
  const breachIndex = series.findIndex((p) => p.balance < threshold);
  const trough = series.reduce((m, p) => (p.balance < m.balance ? p : m), series[0]);
  return { breachIndex, breachDay: breachIndex >= 0 ? series[breachIndex] : null, trough };
}

export const GAP = detectGap(FORECAST_DATA, 0);
export const GAP_DAY = GAP.breachDay; // kept for existing call sites

// --- Lender marketplace (economics + ranking computed in code) ---------------
type LenderBase = {
  id: number; lender: string; logo: string; apr: number;
  termMonths: number; disbursement: string; color: string; maxAmount: number;
};

const LENDERS: LenderBase[] = [
  { id: 1, lender: "Funding Circle NL",        logo: "FC", apr: 7.4, termMonths: 6,  disbursement: "Next business day", color: "#10b981", maxAmount: 25000 },
  { id: 2, lender: "October Finance",          logo: "OC", apr: 9.1, termMonths: 12, disbursement: "Next business day", color: "#6366f1", maxAmount: 25000 },
  { id: 3, lender: "Qredits Microfinanciering", logo: "QR", apr: 8.3, termMonths: 9,  disbursement: "2 business days",   color: "#f59e0b", maxAmount: 18000 },
];

export type LenderOffer = LenderBase & {
  amount: number;
  term: string;
  monthlyPayment: number;
  totalRepayable: number;
  totalCost: number;
  highlight: string | null;
};

/** Standard annuity payment for a fully-amortising loan. */
function annuity(principal: number, aprPct: number, n: number): number {
  const r = aprPct / 100 / 12;
  return r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
}

/**
 * Build and RANK offers for a requested amount: compute each lender's real monthly
 * payment and total cost of credit, sort cheapest-first, and tag the winners.
 */
export function rankOffers(amountRequested: number): LenderOffer[] {
  const offers: LenderOffer[] = LENDERS.map((l) => {
    const amount = Math.min(amountRequested, l.maxAmount);
    const monthlyPayment = Math.round(annuity(amount, l.apr, l.termMonths));
    const totalRepayable = monthlyPayment * l.termMonths;
    return {
      ...l, amount, term: `${l.termMonths} months`,
      monthlyPayment, totalRepayable, totalCost: totalRepayable - amount, highlight: null,
    };
  });
  const ranked = [...offers].sort((a, b) => a.totalCost - b.totalCost);
  const cheapestMonthly = [...offers].sort((a, b) => a.monthlyPayment - b.monthlyPayment)[0];
  ranked[0].highlight = "Best match";                       // lowest total cost of credit
  if (cheapestMonthly.id !== ranked[0].id) cheapestMonthly.highlight = "Lowest monthly";
  return ranked;
}

export const FINANCE_AMOUNT_OPTIONS = [15000, 18000, 20000];
export const DEFAULT_FINANCE_AMOUNT = 20000;
export const LENDER_OFFERS = rankOffers(DEFAULT_FINANCE_AMOUNT);

// --- Financed scenario (computed overlay of a chosen offer) ------------------
/** Disburse just before the gap, then subtract equal monthly repayments. */
export function applyFinancing(base: ForecastPoint[], offer: LenderOffer, disburseDay = 30): ForecastPoint[] {
  const events: Record<number, number> = { [disburseDay]: offer.amount };
  for (let k = 1; k <= offer.termMonths; k++) {
    const day = disburseDay + 30 * k;
    if (day <= base.length) events[day] = (events[day] || 0) - offer.monthlyPayment;
  }
  let delta = 0;
  return base.map((p) => {
    delta += events[p.day] || 0;
    return { ...p, balance: p.balance + delta, lower: p.lower + delta, upper: p.upper + delta };
  });
}

export const FINANCED_DATA = applyFinancing(FORECAST_DATA, LENDER_OFFERS[0]);

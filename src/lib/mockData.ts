// Mock SME: "De Gouden Korst" – a Dutch artisan bakery in Rotterdam

export const SME_PROFILE = {
  name: "De Gouden Korst BV",
  owner: "Maria van den Berg",
  sector: "Food & Beverage – Artisan Bakery",
  location: "Rotterdam, Netherlands",
  bankConnected: "ING Business",
  accountingConnected: "Exact Online",
  currentBalance: 14200,
};

export const LENDER_OFFERS = [
  {
    id: 1,
    lender: "Funding Circle NL",
    logo: "FC",
    amount: 20000,
    term: "6 months",
    apr: 7.4,
    monthlyPayment: 3478,
    disbursement: "Next business day",
    highlight: "Best rate",
    color: "#10b981",
  },
  {
    id: 2,
    lender: "October Finance",
    logo: "OC",
    amount: 20000,
    term: "12 months",
    apr: 9.1,
    monthlyPayment: 1842,
    disbursement: "Next business day",
    highlight: "Lowest monthly",
    color: "#6366f1",
  },
  {
    id: 3,
    lender: "Qredits Microfinanciering",
    logo: "QR",
    amount: 18000,
    term: "9 months",
    apr: 8.3,
    monthlyPayment: 2094,
    disbursement: "2 business days",
    highlight: null,
    color: "#f59e0b",
  },
];

export type ForecastPoint = {
  day: number;
  date: string;
  balance: number;
  lower: number;
  upper: number;
  label?: string;
};

function generateForecast(extraEvents: Record<number, number> = {}): ForecastPoint[] {
  const days: ForecastPoint[] = [];
  let balance = 14200;

  const baseEvents: Record<number, number> = {
    3: -4800,   // Supplier invoice (flour, butter)
    7: 5400,    // Weekly revenue
    10: -3200,  // Staff wages
    13: -1800,  // Utilities
    14: 5200,   // Weekly revenue
    17: -4600,  // Supplier invoice
    21: 5000,   // Weekly revenue
    24: -3200,  // Staff wages
    28: 4200,   // Weekly revenue (quiet week)
    29: -2400,  // Ingredient restock
    30: -3200,  // Staff wages
    31: -18000, // EMERGENCY oven replacement — triggers the liquidity gap
    33: -1800,  // Utilities
    35: 5400,   // Weekly revenue
    38: -1200,  // Misc
    42: 6800,   // Weekly revenue (balance recovers above zero)
    45: -3200,  // Staff wages
    49: 5400,   // Weekly revenue
    56: 5600,   // Weekly revenue
    57: -3200,  // Staff wages
    63: 5800,   // Weekly revenue
    65: -4500,  // Supplier invoice
    70: 6000,   // Weekly revenue (Christmas build-up)
    71: -3200,  // Staff wages
    77: 6400,   // Christmas season
    84: 4600,
    85: -3200,  // Staff wages
    90: 3400,
  };

  // Merge financing events (disbursement + repayments) on top of the base pattern
  const events: Record<number, number> = { ...baseEvents };
  for (const [day, amount] of Object.entries(extraEvents)) {
    events[Number(day)] = (events[Number(day)] || 0) + amount;
  }

  const today = new Date(2025, 10, 15);

  for (let d = 1; d <= 90; d++) {
    if (events[d]) balance += events[d];
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const spread = Math.min(d * 180, 3200);
    days.push({
      day: d,
      date: date.toLocaleDateString("en-NL", { month: "short", day: "numeric" }),
      balance: Math.round(balance),
      lower: Math.round(balance - spread),
      upper: Math.round(balance + spread),
      label: d === 31 ? "Gap" : undefined,
    });
  }
  return days;
}

// The recommended offer (Funding Circle): €20,000 disbursed ahead of the forecast
// shortfall, repaid in equal monthly instalments of €3,478 over 6 months. Because the
// gap is detected weeks in advance, the loan is timed to land before the oven cost hits.
const FINANCING_EVENTS: Record<number, number> = {
  30: 20000,  // Disbursement — arrives just before the shortfall, preventing the gap
  60: -3478,  // Repayment 1
  90: -3478,  // Repayment 2 (within the 90-day window)
};

export const FORECAST_DATA = generateForecast();
export const FINANCED_DATA = generateForecast(FINANCING_EVENTS);
export const GAP_DAY = FORECAST_DATA.find((d) => d.balance < 0);
export const GAP_INDEX = FORECAST_DATA.findIndex((d) => d.balance < 0);

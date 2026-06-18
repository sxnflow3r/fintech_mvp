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

function generateForecast(): ForecastPoint[] {
  const days: ForecastPoint[] = [];
  let balance = 14200;

  const events: Record<number, number> = {
    3: -4800,
    7: 9200,
    14: 9400,
    15: -3200,
    17: -1800,
    21: 8900,
    28: 8600,
    29: -3200,
    31: -12400, // Oven lease + quarterly rent – triggers gap
    35: 8100,
    42: 7900,
    43: -3200,
    45: -4200,
    49: 7800,
    56: 8200,
    57: -3200,
    63: 7600,
    65: -4500,
    70: 7400,
    71: -3200,
    77: 9800,
    84: 11200,
    85: -3200,
    90: 12400,
  };

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

export const FORECAST_DATA = generateForecast();
export const GAP_DAY = FORECAST_DATA.find((d) => d.balance < 0);
export const GAP_INDEX = FORECAST_DATA.findIndex((d) => d.balance < 0);

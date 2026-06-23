"use client";
import { AlertTriangle, TrendingUp, ArrowRight, Wallet, Calendar, Activity, Brain, ShieldCheck, CheckCircle2 } from "lucide-react";
import {
  FORECAST_DATA, HEALTHY_DATA, FINANCED_DATA, SME_PROFILE, AVG_MONTHLY_REVENUE,
  detectGap, applyFinancing, type LenderOffer,
} from "@/lib/mockData";
import CashFlowChart from "@/components/CashFlowChart";
import { useState } from "react";

interface DashboardScreenProps {
  onGapDetected: () => void;
  financedOffer?: LenderOffer | null;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function DashboardScreen({ onGapDetected, financedOffer }: DashboardScreenProps) {
  // Scenario toggle lets a user see both the crisis and the healthy month — so the
  // UX isn't only the happy/unhappy single path.
  const [scenario, setScenario] = useState<"gap" | "healthy">("gap");
  const data = scenario === "healthy" ? HEALTHY_DATA : FORECAST_DATA;
  const gap = detectGap(data, 0);
  const financed = financedOffer ? applyFinancing(data, financedOffer) : FINANCED_DATA;
  const hasGap = !!gap.breachDay && !financedOffer;

  return (
    <div className="min-h-screen text-white">
      {/* Top nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: "var(--navy-border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--teal)" }}>
            <span className="text-[#0a192c] font-bold text-sm">T</span>
          </div>
          <span className="font-display text-base">Treasure</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
            style={{ background: "rgba(32,203,184,0.1)", color: "var(--teal)" }}>
            <span className="w-1.5 h-1.5 rounded-full pulse-ring" style={{ background: "var(--teal)" }} />
            Live · synced just now
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "var(--navy-card)", color: "var(--teal)" }}>
            MB
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-7">
        {/* Greeting + scenario toggle */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl mb-1">{SME_PROFILE.name}</h1>
            <p className="text-slate-400 text-sm">{SME_PROFILE.sector} · {SME_PROFILE.location}</p>
          </div>
          {!financedOffer && (
            <div className="flex items-center gap-1 rounded-lg p-1 text-xs" style={{ background: "var(--navy-card)", border: "1px solid var(--navy-border)" }}>
              {(["gap", "healthy"] as const).map((s) => (
                <button key={s} onClick={() => setScenario(s)}
                  className="px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer"
                  style={scenario === s ? { background: "var(--teal)", color: "#0a192c" } : { color: "#94a3b8" }}>
                  {s === "gap" ? "Gap month" : "Healthy month"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <KpiCard icon={<Wallet size={15} />} label="Current balance" value={fmt(SME_PROFILE.currentBalance)} sub={`via ${SME_PROFILE.accountingConnected} · synced daily`} />
          <KpiCard icon={<TrendingUp size={15} />} label="Avg. monthly revenue" value={fmt(AVG_MONTHLY_REVENUE)} sub="trailing 3 months" />
          <KpiCard
            icon={<Calendar size={15} />}
            label="Next liquidity gap"
            value={hasGap ? gap.breachDay!.date : "None"}
            sub={hasGap ? `${fmt(gap.trough.balance)} projected low` : "all clear · 90 days"}
            alert={hasGap}
          />
        </div>

        {/* Chart */}
        <div className="rounded-2xl border p-6 mb-5" style={{ background: "var(--navy-card)", borderColor: "var(--navy-border)" }}>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Brain size={16} style={{ color: "var(--teal)" }} />
                <h2 className="font-display text-base">90-day cash flow forecast</h2>
              </div>
              <p className="text-slate-400 text-xs mt-1 ml-6">Gradient-boosted quantile model · 80% interval widens with horizon</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded inline-block" style={{ background: "var(--teal)" }} />Forecast</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block" style={{ background: "rgba(32,203,184,0.2)" }} />80% CI</span>
            </div>
          </div>

          <CashFlowChart data={data} financedData={financed} defaultFinanced={!!financedOffer} />
        </div>

        {/* State banner: financing active / gap detected / all clear */}
        {financedOffer ? (
          <Banner tone="good" icon={<ShieldCheck size={18} style={{ color: "var(--teal)" }} />}
            title={`Financing active — ${fmt(financedOffer.amount)} from ${financedOffer.lender}`}
            body={`The gap on ${gap.breachDay?.date ?? "the forecast"} is covered. Repayments of ${fmt(financedOffer.monthlyPayment)}/month over ${financedOffer.term} are already in the projection above.`} />
        ) : hasGap ? (
          <div className="rounded-xl p-5 flex items-start gap-4 animate-in"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(248,113,113,0.35)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(239,68,68,0.15)" }}>
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-300 text-sm">Liquidity gap detected on {gap.breachDay!.date}</p>
              <p className="text-red-300/70 text-xs mt-1 leading-relaxed">
                Projected balance falls to <strong>{fmt(gap.trough.balance)}</strong> by {gap.trough.date}. An emergency oven
                replacement lands before the pre-Christmas revenue arrives. Treasure has already pre-qualified you with 3 lenders.
              </p>
            </div>
            <button onClick={onGapDetected}
              className="shrink-0 flex items-center gap-1.5 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all cursor-pointer hover:brightness-110"
              style={{ background: "#ef4444" }}>
              View offers <ArrowRight size={13} />
            </button>
          </div>
        ) : (
          <Banner tone="good" icon={<CheckCircle2 size={18} style={{ color: "var(--teal)" }} />}
            title="No liquidity gap in the next 90 days"
            body="The forecast stays above zero across the whole horizon, including the 80% confidence band. Nothing to action — we’ll alert you the moment that changes." />
        )}

        {/* Driver breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 animate-in">
          <DriverCard label="Largest outflow" value="€ 18,000" detail="Emergency oven replacement · Dec 16" />
          <DriverCard label="Next inflow" value="€ 6,000" detail="Christmas revenue · late Dec" />
          <DriverCard label="Projected 90-day low" value={fmt(gap.trough.balance)} detail={`worst point · ${gap.trough.date}`} teal={!hasGap} />
        </div>
      </div>
    </div>
  );
}

function Banner({ tone, icon, title, body }: { tone: "good"; icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl p-5 flex items-start gap-4 animate-in"
      style={{ background: "rgba(32,203,184,0.07)", border: "1px solid rgba(32,203,184,0.3)" }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(32,203,184,0.12)" }}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm" style={{ color: "var(--teal)" }}>{title}</p>
        <p className="text-slate-300/80 text-xs mt-1 leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, alert }: { icon: React.ReactNode; label: string; value: string; sub: string; alert?: boolean }) {
  return (
    <div className="rounded-xl border p-4"
      style={{
        background: alert ? "rgba(239,68,68,0.06)" : "var(--navy-card)",
        borderColor: alert ? "rgba(248,113,113,0.3)" : "var(--navy-border)",
      }}>
      <div className="flex items-center gap-2 text-xs mb-2" style={{ color: alert ? "#f87171" : "#94a3b8" }}>
        {icon}<span>{label}</span>
      </div>
      <p className="text-xl font-display" style={{ color: alert ? "#fca5a5" : "#fff" }}>{value}</p>
      <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
    </div>
  );
}

function DriverCard({ label, value, detail, teal }: { label: string; value: string; detail: string; teal?: boolean }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "var(--navy-card)", borderColor: "var(--navy-border)" }}>
      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-2"><Activity size={12} />{label}</div>
      <p className="text-lg font-display" style={{ color: teal ? "var(--teal)" : "#fff" }}>{value}</p>
      <p className="text-slate-500 text-xs mt-0.5">{detail}</p>
    </div>
  );
}

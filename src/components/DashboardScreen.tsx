"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, TrendingUp, ArrowRight, Wallet, Calendar, Activity, Brain } from "lucide-react";
import { FORECAST_DATA, FINANCED_DATA, SME_PROFILE, GAP_DAY, AVG_MONTHLY_REVENUE } from "@/lib/mockData";
import CashFlowChart from "@/components/CashFlowChart";

interface DashboardScreenProps {
  onGapDetected: () => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function DashboardScreen({ onGapDetected }: DashboardScreenProps) {
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAlertVisible(true), 1900);
    return () => clearTimeout(t);
  }, []);

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
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="font-display text-2xl mb-1">{SME_PROFILE.name}</h1>
          <p className="text-slate-400 text-sm">{SME_PROFILE.sector} · {SME_PROFILE.location}</p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <KpiCard icon={<Wallet size={15} />} label="Current balance" value={fmt(SME_PROFILE.currentBalance)} sub={`via ${SME_PROFILE.accountingConnected} · synced daily`} />
          <KpiCard icon={<TrendingUp size={15} />} label="Avg. monthly revenue" value={fmt(AVG_MONTHLY_REVENUE)} sub="trailing 3 months" />
          <KpiCard icon={<Calendar size={15} />} label="Next liquidity gap" value={GAP_DAY ? GAP_DAY.date : "None"} sub={GAP_DAY ? `${fmt(GAP_DAY.balance)} projected` : "all clear"} alert={!!GAP_DAY} />
        </div>

        {/* Chart */}
        <div className="rounded-2xl border p-6 mb-5" style={{ background: "var(--navy-card)", borderColor: "var(--navy-border)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Brain size={16} style={{ color: "var(--teal)" }} />
                <h2 className="font-display text-base">90-day cash flow forecast</h2>
              </div>
              <p className="text-slate-400 text-xs mt-1 ml-6">Gradient-boosted model · 80% interval widens with horizon, sharpens as data accumulates</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded inline-block" style={{ background: "var(--teal)" }} />Forecast</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded inline-block" style={{ background: "rgba(32,203,184,0.2)" }} />80% CI</span>
            </div>
          </div>

          <CashFlowChart data={FORECAST_DATA} financedData={FINANCED_DATA} />
        </div>

        {/* Alert banner */}
        {alertVisible && GAP_DAY && (
          <div className="rounded-xl p-5 flex items-start gap-4 animate-in"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(248,113,113,0.35)" }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(239,68,68,0.15)" }}>
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-300 text-sm">Liquidity gap detected on {GAP_DAY.date}</p>
              <p className="text-red-300/70 text-xs mt-1 leading-relaxed">
                Projected balance dips to <strong>{fmt(GAP_DAY.balance)}</strong>. An emergency oven replacement lands before
                the pre-Christmas revenue arrives. Treasure has already pre-qualified you with 3 lenders — no paperwork needed.
              </p>
            </div>
            <button onClick={onGapDetected}
              className="shrink-0 flex items-center gap-1.5 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-all cursor-pointer hover:brightness-110"
              style={{ background: "#ef4444" }}>
              View offers <ArrowRight size={13} />
            </button>
          </div>
        )}

        {/* Driver breakdown */}
        {alertVisible && (
          <div className="grid grid-cols-3 gap-4 mt-5 animate-in">
            <DriverCard label="Largest outflow" value="€ 18,000" detail="Emergency oven replacement · Dec 16" />
            <DriverCard label="Next inflow" value="€ 6,800" detail="Christmas revenue · Dec 27" />
            <DriverCard label="Forecast confidence" value="87%" detail="↑ from 71% last month" teal />
          </div>
        )}
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

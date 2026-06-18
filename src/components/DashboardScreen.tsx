"use client";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer,
} from "recharts";
import { AlertTriangle, TrendingUp, ArrowRight, Euro, Calendar, RefreshCw } from "lucide-react";
import { FORECAST_DATA, SME_PROFILE, GAP_DAY } from "@/lib/mockData";

interface DashboardScreenProps {
  onGapDetected: () => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function DashboardScreen({ onGapDetected }: DashboardScreenProps) {
  const [revealed, setRevealed] = useState(0);
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    // Animate forecast line drawing
    const interval = setInterval(() => {
      setRevealed((prev) => {
        if (prev >= FORECAST_DATA.length) {
          clearInterval(interval);
          setTimeout(() => setAlertVisible(true), 400);
          return prev;
        }
        return prev + 2;
      });
    }, 18);
    return () => clearInterval(interval);
  }, []);

  const displayData = FORECAST_DATA.slice(0, Math.min(revealed, FORECAST_DATA.length));
  const gapDayIndex = FORECAST_DATA.findIndex((d) => d.balance < 0);
  const showGapLine = revealed > gapDayIndex && gapDayIndex !== -1;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      return (
        <div className="bg-[#1a2235] border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
          <p className="text-slate-400 mb-1">{label}</p>
          <p className={`font-semibold ${val < 0 ? "text-red-400" : "text-emerald-400"}`}>
            {fmt(val)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Top nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-emerald-400 flex items-center justify-center">
            <span className="text-[#0a0f1e] font-bold text-xs">T</span>
          </div>
          <span className="font-semibold text-sm">Treasure</span>
          <span className="text-slate-600 text-sm">·</span>
          <span className="text-slate-400 text-sm">{SME_PROFILE.name}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <RefreshCw size={12} />
          <span>Live · Updated just now</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <KpiCard
            icon={<Euro size={16} />}
            label="Current balance"
            value={fmt(SME_PROFILE.currentBalance)}
            sub="ING Business"
            positive
          />
          <KpiCard
            icon={<TrendingUp size={16} />}
            label="Avg. monthly revenue"
            value="€ 34,800"
            sub="Last 3 months"
            positive
          />
          <KpiCard
            icon={<Calendar size={16} />}
            label="Next gap forecast"
            value={GAP_DAY ? GAP_DAY.date : "None"}
            sub={GAP_DAY ? `${fmt(GAP_DAY.balance)} projected` : "All clear"}
            positive={false}
            alert={!!GAP_DAY}
          />
        </div>

        {/* Chart */}
        <div className="bg-[#111827] rounded-2xl border border-slate-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-base">90-day cash flow forecast</h2>
              <p className="text-slate-400 text-xs mt-0.5">Shaded band shows 80% confidence interval</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-emerald-400 inline-block rounded" />
                Forecast
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-emerald-400/20 inline-block rounded" />
                Confidence
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={displayData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 10 }}
                tickLine={false}
                interval={13}
                axisLine={{ stroke: "#1e293b" }}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              {showGapLine && (
                <ReferenceLine
                  x={GAP_DAY?.date}
                  stroke="#ef4444"
                  strokeDasharray="4 3"
                  label={{ value: "⚠ Gap", fill: "#ef4444", fontSize: 10, position: "top" }}
                />
              )}
              <ReferenceLine y={0} stroke="#334155" strokeDasharray="2 2" />
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="url(#confGrad)"
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="#0a0f1e"
                fillOpacity={1}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#balanceGrad)"
                dot={false}
                activeDot={{ r: 4, fill: "#10b981" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Alert banner */}
        {alertVisible && GAP_DAY && (
          <div className="bg-red-950/60 border border-red-500/40 rounded-xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-300 text-sm">Liquidity gap detected on {GAP_DAY.date}</p>
              <p className="text-red-400/80 text-xs mt-1">
                Projected balance: <strong>{fmt(GAP_DAY.balance)}</strong>. Oven lease + quarterly rent fall due simultaneously.
                Treasure has pre-qualified you with 3 lenders.
              </p>
            </div>
            <button
              onClick={onGapDetected}
              className="shrink-0 flex items-center gap-1.5 bg-red-500 hover:bg-red-400 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              View offers <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon, label, value, sub, positive, alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  positive: boolean;
  alert?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 ${alert ? "border-red-500/40 bg-red-950/20" : "border-slate-800 bg-[#111827]"}`}>
      <div className={`flex items-center gap-2 text-xs mb-2 ${alert ? "text-red-400" : "text-slate-400"}`}>
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-xl font-semibold ${alert ? "text-red-300" : "text-white"}`}>{value}</p>
      <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
    </div>
  );
}

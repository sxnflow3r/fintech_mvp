"use client";
import { useState, useMemo, useRef } from "react";
import { ForecastPoint } from "@/lib/mockData";

interface CashFlowChartProps {
  data: ForecastPoint[];
  financedData?: ForecastPoint[];
  width?: number;
  height?: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function CashFlowChart({ data, financedData, width = 900, height = 290 }: CashFlowChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [showFinanced, setShowFinanced] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const padL = 52, padR = 16, padT = 18, padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const { minV, maxV } = useMemo(() => {
    // Always scale to BOTH datasets so the axis is fixed across the financing
    // toggle — the before/after comparison stays honest (same Y-axis).
    const sets = financedData ? [...data, ...financedData] : data;
    const vals = sets.flatMap((d) => [d.lower, d.upper, d.balance]);
    const lo = Math.min(...vals, 0);
    const hi = Math.max(...vals, 0);
    const pad = (hi - lo) * 0.08;
    return { minV: lo - pad, maxV: hi + pad };
  }, [data, financedData]);

  const x = (i: number) => padL + (i / (data.length - 1)) * innerW;
  const y = (v: number) => padT + (1 - (v - minV) / (maxV - minV)) * innerH;
  const zeroY = y(0);

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.balance).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${x(data.length - 1).toFixed(1)} ${zeroY.toFixed(1)} L ${x(0).toFixed(1)} ${zeroY.toFixed(1)} Z`;
  const financedLinePath = financedData
    ? financedData.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.balance).toFixed(1)}`).join(" ")
    : "";
  const financedAreaPath = financedData
    ? `${financedLinePath} L ${x(financedData.length - 1).toFixed(1)} ${zeroY.toFixed(1)} L ${x(0).toFixed(1)} ${zeroY.toFixed(1)} Z`
    : "";
  const bandPath =
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.upper).toFixed(1)}`).join(" ") +
    " " +
    data.slice().reverse().map((d, i) => `L ${x(data.length - 1 - i).toFixed(1)} ${y(d.lower).toFixed(1)}`).join(" ") +
    " Z";

  const gapStart = data.findIndex((d) => d.balance < 0);
  const gapEnd = data.findIndex((d, i) => i > gapStart && d.balance >= 0);

  const ticks = useMemo(() => {
    const step = (maxV - minV) / 4;
    return Array.from({ length: 5 }, (_, i) => minV + step * i);
  }, [minV, maxV]);
  const xLabels = data.filter((_, i) => i % 13 === 0);
  const hoverPoint = hover !== null ? data[hover] : null;

  return (
    <div className="relative w-full">
      {financedData && (
        <div className="flex items-center justify-end gap-2 mb-2">
          <span className="text-xs text-slate-500">
            {showFinanced ? "Showing forecast with financing" : "Showing forecast without financing"}
          </span>
          <button
            onClick={() => setShowFinanced((v) => !v)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            style={
              showFinanced
                ? { background: "rgba(32,203,184,0.12)", color: "var(--teal)", border: "1px solid rgba(32,203,184,0.3)" }
                : { background: "var(--teal)", color: "#0a192c" }
            }
          >
            {showFinanced ? "View without financing" : "View with financing"}
          </button>
        </div>
      )}
      <style>{`
        @keyframes cfDraw { from { stroke-dashoffset: 2600; } to { stroke-dashoffset: 0; } }
        @keyframes cfFade { from { opacity: 0; } to { opacity: 1; } }
        .cf-line { stroke-dasharray: 2600; animation: cfDraw 1.6s ease-out forwards; }
        .cf-fill { animation: cfFade 1.8s ease forwards; }
      `}</style>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ display: "block" }}
        onMouseMove={(e) => {
          const rect = svgRef.current!.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * width;
          const i = Math.round(((px - padL) / innerW) * (data.length - 1));
          if (i >= 0 && i < data.length) setHover(i);
        }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="cfArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#20cbb8" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#20cbb8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="cfBand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6cf3ec" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#6cf3ec" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={y(t)} x2={width - padR} y2={y(t)} stroke="#1b3850" strokeWidth="1" strokeDasharray="3 3" />
            <text x={padL - 8} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#64748b">€{(t / 1000).toFixed(0)}k</text>
          </g>
        ))}

        {gapStart >= 0 && !showFinanced && (
          <rect x={x(gapStart)} y={padT}
            width={(gapEnd > gapStart ? x(gapEnd) : x(data.length - 1)) - x(gapStart)}
            height={innerH} fill="#ef4444" fillOpacity="0.07" />
        )}

        <line x1={padL} y1={zeroY} x2={width - padR} y2={zeroY} stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />

        {/* Base (unfinanced) forecast — full teal normally, dimmed when comparing */}
        {!showFinanced && <path className="cf-fill" d={bandPath} fill="url(#cfBand)" />}
        {!showFinanced && <path className="cf-fill" d={areaPath} fill="url(#cfArea)" />}
        <path
          className={showFinanced ? "" : "cf-line"}
          d={linePath}
          fill="none"
          stroke="#20cbb8"
          strokeWidth={showFinanced ? 1.5 : 2.5}
          strokeOpacity={showFinanced ? 0.35 : 1}
          strokeDasharray={showFinanced ? "5 4" : undefined}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Financed forecast overlay — the gap closed, with repayment steps after */}
        {showFinanced && financedData && (
          <>
            <path className="cf-fill" d={financedAreaPath} fill="url(#cfArea)" />
            <path className="cf-line" d={financedLinePath} fill="none" stroke="#20cbb8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}

        {gapStart >= 0 && !showFinanced && (
          <g>
            <line x1={x(gapStart)} y1={padT} x2={x(gapStart)} y2={height - padB} stroke="#f87171" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={x(gapStart)} y={padT - 5} textAnchor="middle" fontSize="10" fill="#f87171" fontWeight="600">⚠ Gap</text>
          </g>
        )}

        {xLabels.map((d, i) => (
          <text key={i} x={x(i * 13)} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748b">{d.date}</text>
        ))}

        {hoverPoint && (
          <g>
            <line x1={x(hover!)} y1={padT} x2={x(hover!)} y2={height - padB} stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.4" />
            <circle cx={x(hover!)} cy={y(hoverPoint.balance)} r="4" fill="#20cbb8" stroke="#0a192c" strokeWidth="2" />
          </g>
        )}
      </svg>

      {hoverPoint && (
        <div className="absolute pointer-events-none rounded-lg px-3 py-2 text-xs shadow-2xl border"
          style={{ background: "var(--navy-deep)", borderColor: "var(--navy-border)",
            left: `${(x(hover!) / width) * 100}%`, top: 8, transform: "translateX(-50%)" }}>
          <div className="text-slate-400 mb-0.5">{hoverPoint.date}</div>
          <div className="font-bold" style={{ color: hoverPoint.balance < 0 ? "#f87171" : "#20cbb8" }}>{fmt(hoverPoint.balance)}</div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { CheckCircle2, Loader2, BookOpen, ArrowRight, Shield, Sparkles } from "lucide-react";

interface ConnectScreenProps {
  onComplete: () => void;
}

type StepState = "idle" | "loading" | "done";

export default function ConnectScreen({ onComplete }: ConnectScreenProps) {
  const [accountingState, setAccountingState] = useState<StepState>("idle");

  const connectAccounting = () => {
    setAccountingState("loading");
    setTimeout(() => setAccountingState("done"), 2200);
  };

  const done = accountingState === "done";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient teal glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #20cbb8 0%, transparent 70%)" }} />

      {/* Logo */}
      <div className="mb-10 text-center relative z-10">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--teal)" }}>
            <span className="text-[#0a192c] font-bold text-lg">T</span>
          </div>
          <span className="text-white text-3xl font-display">Treasure</span>
        </div>
        <p className="text-slate-400 text-sm">The unified cash flow operating system for European SMEs</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border p-8 relative z-10"
        style={{ background: "var(--navy-card)", borderColor: "var(--navy-border)" }}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} style={{ color: "var(--teal)" }} />
          <h1 className="text-white text-xl font-display">Connect your accounts</h1>
        </div>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          About 5 minutes, no manual data entry. Connect your accounting software once — it already holds your
          reconciled bank transactions, so that&apos;s all we need to start forecasting.
        </p>

        <ConnectItem
          icon={<BookOpen size={20} />}
          title="Exact Online"
          subtitle="Invoices · payables · bank transactions · OAuth 2.0"
          state={accountingState}
          onConnect={connectAccounting}
          disabled={accountingState !== "idle"}
        />

        {/* Supported platforms — one unified integration covers the fragmented Dutch market */}
        <div className="mt-5">
          <p className="text-slate-500 text-xs mb-2.5">Also supported via our unified accounting API</p>
          <div className="flex flex-wrap gap-2">
            {["AFAS", "Visma / Yuki", "Moneybird", "SnelStart", "Twinfield"].map((name) => (
              <span key={name} className="text-xs px-2.5 py-1 rounded-md"
                style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8", border: "1px solid var(--navy-border)" }}>
                {name}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={onComplete}
          disabled={!done}
          className={`w-full mt-8 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300
            ${done ? "text-[#0a192c] cursor-pointer" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}
          style={done ? { background: "var(--teal)", boxShadow: "0 8px 24px -6px rgba(32,203,184,0.5)" } : {}}
        >
          {done ? (<>View your forecast <ArrowRight size={16} /></>) : "Connect your accounting software to continue"}
        </button>

        <div className="mt-5 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <Shield size={12} />
          <span>Read-only · revoke any time · direct bank feeds via PSD2 in a later phase</span>
        </div>
      </div>
    </div>
  );
}

function ConnectItem({ icon, title, subtitle, state, onConnect, disabled }: {
  icon: React.ReactNode; title: string; subtitle: string;
  state: StepState; onConnect: () => void; disabled: boolean;
}) {
  const done = state === "done";
  return (
    <div className="rounded-xl border p-4 flex items-center gap-4 transition-all duration-300"
      style={{
        background: done ? "rgba(32,203,184,0.08)" : "rgba(255,255,255,0.02)",
        borderColor: done ? "rgba(32,203,184,0.4)" : "var(--navy-border)",
      }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors"
        style={{
          background: done ? "rgba(32,203,184,0.15)" : "rgba(255,255,255,0.04)",
          color: done ? "var(--teal)" : "#64748b",
        }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold">{title}</p>
        <p className="text-slate-400 text-xs truncate">{subtitle}</p>
      </div>
      <div className="shrink-0">
        {state === "idle" && (
          <button onClick={onConnect} disabled={disabled}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${disabled ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "cursor-pointer text-[#0a192c]"}`}
            style={!disabled ? { background: "var(--teal)" } : {}}>
            Connect
          </button>
        )}
        {state === "loading" && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Loader2 size={14} className="animate-spin" /><span>Authorising…</span>
          </div>
        )}
        {done && (
          <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--teal)" }}>
            <CheckCircle2 size={14} /><span>Connected</span>
          </div>
        )}
      </div>
    </div>
  );
}

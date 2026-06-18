"use client";
import { useState } from "react";
import { CheckCircle, Loader2, Building2, BookOpen, ArrowRight, Shield } from "lucide-react";

interface ConnectScreenProps {
  onComplete: () => void;
}

type StepState = "idle" | "loading" | "done";

export default function ConnectScreen({ onComplete }: ConnectScreenProps) {
  const [bankState, setBankState] = useState<StepState>("idle");
  const [accountingState, setAccountingState] = useState<StepState>("idle");

  const connectBank = () => {
    setBankState("loading");
    setTimeout(() => setBankState("done"), 2200);
  };

  const connectAccounting = () => {
    setAccountingState("loading");
    setTimeout(() => setAccountingState("done"), 2000);
  };

  const bothDone = bankState === "done" && accountingState === "done";

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-400 flex items-center justify-center">
            <span className="text-[#0a0f1e] font-bold text-sm">T</span>
          </div>
          <span className="text-white text-2xl font-semibold tracking-tight">Treasure</span>
        </div>
        <p className="text-slate-400 text-sm">Cash flow operating system for European SMEs</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-[#111827] rounded-2xl border border-slate-800 p-8">
        <h1 className="text-white text-xl font-semibold mb-1">Connect your accounts</h1>
        <p className="text-slate-400 text-sm mb-8">
          Takes about 5 minutes. We use PSD2 open banking — read-only access, revoke any time.
        </p>

        {/* Bank connection */}
        <ConnectItem
          icon={<Building2 size={20} />}
          title="ING Business"
          subtitle="Bank account via PSD2 open banking"
          state={bankState}
          onConnect={connectBank}
          disabled={bankState !== "idle"}
        />

        <div className="my-4" />

        {/* Accounting connection */}
        <ConnectItem
          icon={<BookOpen size={20} />}
          title="Exact Online"
          subtitle="Invoices, chart of accounts, payables"
          state={accountingState}
          onConnect={connectAccounting}
          disabled={accountingState !== "idle" || bankState !== "done"}
        />

        {/* CTA */}
        <div className="mt-8">
          <button
            onClick={onComplete}
            disabled={!bothDone}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all duration-300
              ${bothDone
                ? "bg-emerald-400 text-[#0a0f1e] hover:bg-emerald-300 cursor-pointer shadow-lg shadow-emerald-400/20"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
          >
            {bothDone ? (
              <>View your forecast <ArrowRight size={16} /></>
            ) : (
              "Connect both accounts to continue"
            )}
          </button>
        </div>

        {/* Trust badge */}
        <div className="mt-5 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <Shield size={12} />
          <span>AISP licensed · De Nederlandsche Bank · PSD2 compliant</span>
        </div>
      </div>
    </div>
  );
}

function ConnectItem({
  icon,
  title,
  subtitle,
  state,
  onConnect,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  state: StepState;
  onConnect: () => void;
  disabled: boolean;
}) {
  return (
    <div className={`rounded-xl border p-4 flex items-center gap-4 transition-all duration-300
      ${state === "done" ? "border-emerald-500/40 bg-emerald-950/30" : "border-slate-700 bg-slate-800/40"}`}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
        ${state === "done" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-400"}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{title}</p>
        <p className="text-slate-400 text-xs truncate">{subtitle}</p>
      </div>
      <div className="shrink-0">
        {state === "idle" && (
          <button
            onClick={onConnect}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${disabled
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-emerald-400 text-[#0a0f1e] hover:bg-emerald-300 cursor-pointer"
              }`}
          >
            Connect
          </button>
        )}
        {state === "loading" && (
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Loader2 size={14} className="animate-spin" />
            <span>Authorising…</span>
          </div>
        )}
        {state === "done" && (
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
            <CheckCircle size={14} />
            <span>Connected</span>
          </div>
        )}
      </div>
    </div>
  );
}

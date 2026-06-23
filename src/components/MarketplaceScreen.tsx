"use client";
import { useState } from "react";
import { CheckCircle2, Zap, ArrowLeft, Star, Clock, TrendingDown } from "lucide-react";
import { LENDER_OFFERS, GAP_DAY } from "@/lib/mockData";

interface MarketplaceScreenProps {
  onBack: () => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function MarketplaceScreen({ onBack }: MarketplaceScreenProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = (id: number) => {
    setSelected(id);
    setTimeout(() => setAccepted(true), 300);
  };

  if (accepted && selected !== null) {
    const offer = LENDER_OFFERS.find((o) => o.id === selected)!;
    return <SuccessScreen offer={offer} onBack={onBack} />;
  }

  return (
    <div className="min-h-screen text-white">
      <nav className="border-b px-6 py-4 flex items-center gap-4" style={{ borderColor: "var(--navy-border)" }}>
        <button onClick={onBack} className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer">
          <ArrowLeft size={15} />Dashboard
        </button>
        <span className="text-slate-700">·</span>
        <span className="text-sm text-white font-semibold">Financing marketplace</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
            style={{ background: "rgba(32,203,184,0.12)", color: "var(--teal)" }}>
            <Zap size={12} />Auction complete · gap on {GAP_DAY?.date}
          </div>
          <h1 className="font-display text-3xl mb-2">3 offers in 47 seconds</h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
            Lenders bid against each other using your live bank and accounting data. All offers are binding.
            No paperwork, no separate applications. You see the all-in cost.
          </p>
        </div>

        <div className="space-y-4">
          {LENDER_OFFERS.map((offer, i) => {
            const isSel = selected === offer.id;
            return (
              <div key={offer.id} className="rounded-2xl border p-6 transition-all duration-200"
                style={{
                  background: isSel ? "rgba(32,203,184,0.06)" : "var(--navy-card)",
                  borderColor: isSel ? "rgba(32,203,184,0.5)" : (i === 0 ? "rgba(32,203,184,0.25)" : "var(--navy-border)"),
                }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ background: offer.color + "26", color: offer.color }}>
                    {offer.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-display text-base">{offer.lender}</span>
                      {i === 0 && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "rgba(32,203,184,0.15)", color: "var(--teal)", border: "1px solid rgba(32,203,184,0.25)" }}>
                          <Star size={10} fill="currentColor" />Best match
                        </span>
                      )}
                      {offer.highlight && i !== 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#cbd5e1" }}>
                          {offer.highlight}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <Stat label="Amount" value={fmt(offer.amount)} />
                      <Stat label="Term" value={offer.term} />
                      <Stat label="APR" value={`${offer.apr}%`} icon={<TrendingDown size={11} style={{ color: "var(--teal)" }} />} />
                      <Stat label="Monthly" value={fmt(offer.monthlyPayment)} />
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 text-slate-400 text-xs">
                      <Clock size={11} />Funds in account: {offer.disbursement}
                    </div>
                  </div>
                  <div className="shrink-0 ml-2">
                    <button onClick={() => handleAccept(offer.id)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer hover:brightness-110 ${i === 0 ? "text-[#0a192c]" : "text-white"}`}
                      style={i === 0 ? { background: "var(--teal)", boxShadow: "0 8px 20px -6px rgba(32,203,184,0.5)" } : { background: "rgba(255,255,255,0.08)" }}>
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          Treasure earns a commission from lenders on accepted offers — never from you. You always see the all-in cost.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
      <div className="flex items-center gap-1">{icon}<p className="text-white text-sm font-bold">{value}</p></div>
    </div>
  );
}

function SuccessScreen({ offer, onBack }: { offer: typeof LENDER_OFFERS[0]; onBack: () => void }) {
  const money = (n: number) => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ background: "radial-gradient(circle, #20cbb8 0%, transparent 70%)" }} />
      <div className="text-center max-w-sm relative z-10">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(32,203,184,0.15)", border: "1px solid rgba(32,203,184,0.4)" }}>
          <CheckCircle2 size={36} style={{ color: "var(--teal)" }} />
        </div>
        <h1 className="font-display text-2xl text-white mb-2">Offer accepted</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          {offer.lender} will transfer <span className="text-white font-semibold">{money(offer.amount)}</span> to your
          ING Business account by {offer.disbursement.toLowerCase()}. Gap closed before it happened.
        </p>
        <div className="rounded-xl border p-4 text-left text-xs space-y-2 mb-8"
          style={{ background: "var(--navy-card)", borderColor: "var(--navy-border)" }}>
          <Row label="Lender" value={offer.lender} />
          <Row label="Amount" value={money(offer.amount)} />
          <Row label="Term" value={offer.term} />
          <Row label="APR" value={`${offer.apr}%`} />
          <Row label="Reference" value="TRS-2025-004821" mono />
        </div>
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer flex items-center gap-1.5 mx-auto">
          <ArrowLeft size={14} />Back to dashboard
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`text-white ${mono ? "font-mono" : "font-semibold"}`}>{value}</span>
    </div>
  );
}

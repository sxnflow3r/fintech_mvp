"use client";
import { useState } from "react";
import { CheckCircle, Zap, ArrowLeft, Star, Clock, TrendingDown } from "lucide-react";
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
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} />
          Dashboard
        </button>
        <span className="text-slate-700">·</span>
        <span className="text-sm text-white font-medium">Financing offers</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 text-amber-400 text-xs font-medium mb-4">
            <Zap size={12} />
            Gap detected · {GAP_DAY?.date}
          </div>
          <h1 className="text-2xl font-semibold mb-2">3 offers matched in 47 seconds</h1>
          <p className="text-slate-400 text-sm">
            Lenders compete for your business. All offers are binding and based on your live bank and accounting data.
            No additional paperwork required.
          </p>
        </div>

        {/* Offers */}
        <div className="space-y-4">
          {LENDER_OFFERS.map((offer, i) => (
            <div
              key={offer.id}
              className={`rounded-2xl border p-6 transition-all duration-200
                ${selected === offer.id
                  ? "border-emerald-500/60 bg-emerald-950/20"
                  : "border-slate-800 bg-[#111827] hover:border-slate-700"
                }`}
            >
              <div className="flex items-start gap-4">
                {/* Lender badge */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: offer.color + "33", color: offer.color }}
                >
                  {offer.logo}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-base">{offer.lender}</span>
                    {i === 0 && (
                      <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium border border-emerald-500/20">
                        <Star size={10} fill="currentColor" />
                        Recommended
                      </span>
                    )}
                    {offer.highlight && i !== 0 && (
                      <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                        {offer.highlight}
                      </span>
                    )}
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    <Stat label="Amount" value={fmt(offer.amount)} />
                    <Stat label="Term" value={offer.term} />
                    <Stat
                      label="APR"
                      value={`${offer.apr}%`}
                      icon={<TrendingDown size={11} className="text-emerald-400" />}
                    />
                    <Stat label="Monthly" value={fmt(offer.monthlyPayment)} />
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 text-slate-400 text-xs">
                    <Clock size={11} />
                    <span>Funds in your account: {offer.disbursement}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="shrink-0 ml-2">
                  <button
                    onClick={() => handleAccept(offer.id)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer
                      ${i === 0
                        ? "bg-emerald-400 text-[#0a0f1e] hover:bg-emerald-300 shadow-lg shadow-emerald-400/20"
                        : "bg-slate-700 text-white hover:bg-slate-600"
                      }`}
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-xs mt-8">
          Treasure earns a commission from lenders on accepted offers. You always see the all-in cost.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
      <div className="flex items-center gap-1">
        {icon}
        <p className="text-white text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

function SuccessScreen({ offer, onBack }: { offer: typeof LENDER_OFFERS[0]; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={36} className="text-emerald-400" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-2">Offer accepted</h1>
        <p className="text-slate-400 text-sm mb-6">
          {offer.lender} will transfer{" "}
          <span className="text-white font-medium">
            {new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(offer.amount)}
          </span>{" "}
          to your ING Business account by {offer.disbursement.toLowerCase()}.
          No further action required.
        </p>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 text-left text-xs space-y-2 mb-8">
          <Row label="Lender" value={offer.lender} />
          <Row label="Amount" value={new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(offer.amount)} />
          <Row label="Term" value={offer.term} />
          <Row label="APR" value={`${offer.apr}%`} />
          <Row label="Reference" value="TRS-2025-004821" mono />
        </div>
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white text-sm transition-colors cursor-pointer flex items-center gap-1.5 mx-auto"
        >
          <ArrowLeft size={14} />
          Back to dashboard
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`text-white ${mono ? "font-mono" : "font-medium"}`}>{value}</span>
    </div>
  );
}

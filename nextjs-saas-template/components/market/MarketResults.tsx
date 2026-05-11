"use client";

import type { MarketAnalysis } from "@/app/api/market/analyze/route";

interface Props {
  analysis:  MarketAnalysis;
  location:  string;
  typeLabel: string;
  onReset:   () => void;
}

const TENDANCE_CONFIG = {
  haussiere: { label: "Haussière",  icon: "↑", cls: "bg-white/[0.08] text-white/80 border-white/10" },
  stable:    { label: "Stable",     icon: "→", cls: "bg-white/[0.06] text-white/50 border-white/10" },
  baissiere: { label: "Baissière",  icon: "↓", cls: "bg-white/[0.04] text-white/30 border-white/[0.06]" },
} as const;

function formatPrice(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style:                 "currency",
    currency:              "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function MarketResults({ analysis, location, typeLabel, onReset }: Props) {
  const tendance = TENDANCE_CONFIG[analysis.tendance];

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease]">

      {/* Badge succès + contexte */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
        <p className="text-sm text-white/70">
          Analyse —{" "}
          <span className="font-medium text-white">{location}</span>
          {" · "}{typeLabel}
        </p>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-white/30 underline-offset-2 transition-colors hover:text-white/60 hover:underline"
        >
          Nouvelle analyse
        </button>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        {/* Score marché */}
        <div className="col-span-2 rounded-xl border border-white/[0.06] bg-[#0f0f13] p-5 lg:col-span-1">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-white/25">
            Score marché
          </p>
          <p className="text-5xl font-bold tabular-nums text-white">
            {analysis.score_marche}
            <span className="text-xl text-white/20">/10</span>
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-white/50 transition-all"
              style={{ width: `${analysis.score_marche * 10}%` }}
            />
          </div>
        </div>

        {/* Prix médian m² */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f13] p-5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-white/25">
            Prix médian / m²
          </p>
          <p className="text-2xl font-bold text-white">
            {formatPrice(analysis.prix_median_m2)}
          </p>
          <p className="mt-0.5 text-xs text-white/25">par mètre carré</p>
        </div>

        {/* Tendance */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f13] p-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/25">
            Tendance
          </p>
          <span className={[
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold",
            tendance.cls,
          ].join(" ")}>
            <span className="text-base leading-none">{tendance.icon}</span>
            {tendance.label}
          </span>
        </div>

        {/* Délai de vente */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f13] p-5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-white/25">
            Délai vente moyen
          </p>
          <p className="text-xl font-bold text-white">
            {analysis.delai_vente_moyen}
          </p>
          <p className="mt-0.5 text-xs text-white/25">délai estimé</p>
        </div>
      </div>

      {/* Recommandations pricing + Arguments de vente */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f13] p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] text-xs text-white/50">
              €
            </span>
            <h3 className="text-sm font-semibold text-white/80">Stratégie de prix</h3>
          </div>
          <ol className="space-y-3">
            {analysis.recommandations_pricing.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-white/50">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f13] p-5">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] text-xs text-white/50">
              +
            </span>
            <h3 className="text-sm font-semibold text-white/80">Arguments de vente</h3>
          </div>
          <ul className="space-y-3">
            {analysis.arguments_vente.map((arg, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] text-white/40">
                  –
                </span>
                {arg}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Synthèse */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0f0f13] p-5">
        <div className="mb-3 flex items-center gap-2">
          <SparkleIcon className="h-4 w-4 text-white/40" />
          <h3 className="text-sm font-semibold text-white/80">Synthèse du marché</h3>
        </div>
        <p className="text-sm leading-relaxed text-white/55">
          {analysis.synthese}
        </p>
      </div>
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

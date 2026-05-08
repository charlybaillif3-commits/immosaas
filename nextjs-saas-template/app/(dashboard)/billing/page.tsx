import type { Metadata } from "next";

export const metadata: Metadata = { title: "Facturation" };

type PlanId = "starter" | "pro" | "enterprise";

interface Plan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlight: boolean;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "29 €",
    period: "/ mois",
    description: "Pour les agents indépendants.",
    features: [
      "20 annonces IA / mois",
      "5 analyses de marché",
      "Support par email",
      "1 utilisateur",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "99 €",
    period: "/ mois",
    description: "Pour les agences en croissance.",
    features: [
      "100 annonces IA / mois",
      "Analyses de marché illimitées",
      "Support prioritaire",
      "Jusqu'à 5 utilisateurs",
      "Export CSV & API access",
    ],
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Sur devis",
    period: "",
    description: "Pour les grands réseaux immobiliers.",
    features: [
      "Volume illimité",
      "SLA dédié",
      "Onboarding personnalisé",
      "Utilisateurs illimités",
      "Intégrations sur mesure",
    ],
    highlight: false,
  },
];

const CURRENT_PLAN: PlanId = "pro";

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Facturation</h1>
        <p className="mt-1 text-sm text-white/40">Gérez votre abonnement et vos paiements.</p>
      </div>

      {/* Abonnement actif */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0d0d14] p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/30">Plan actuel</p>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-xl font-semibold text-white">Pro</p>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                Actif
              </span>
            </div>
            <p className="mt-1 text-sm text-white/40">
              Prochain renouvellement le <strong className="text-white/60">1 juin 2026</strong> · 99 €
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white/90"
          >
            Gérer sur Stripe →
          </button>
        </div>

        {/* Usage */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5 sm:grid-cols-3">
          {[
            { label: "Annonces IA",    used: 42, total: 100 },
            { label: "Analyses marché", used: 8, total: 999 },
            { label: "Utilisateurs",   used: 3,  total: 5   },
          ].map((item) => {
            const pct = Math.min(Math.round((item.used / (item.total === 999 ? item.used + 10 : item.total)) * 100), 100);
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-white/40">{item.label}</span>
                  <span className="text-white/60 tabular-nums">
                    {item.used}{item.total !== 999 ? ` / ${item.total}` : " utilisées"}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={["h-full rounded-full", pct > 80 ? "bg-amber-400" : "bg-sky-500"].join(" ")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-white/90">Changer de plan</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === CURRENT_PLAN;
            return (
              <div
                key={plan.id}
                className={[
                  "relative flex flex-col rounded-xl border p-6 transition-colors",
                  plan.highlight
                    ? "border-sky-500/30 bg-sky-500/[0.04]"
                    : "border-white/[0.06] bg-[#0d0d14]",
                ].join(" ")}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-sky-500 px-3 py-0.5 text-[11px] font-semibold text-white">
                    Populaire
                  </span>
                )}

                <div className="mb-4">
                  <p className="text-[13px] font-semibold text-white/60">{plan.name}</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">{plan.price}</span>
                    {plan.period && <span className="text-sm text-white/30">{plan.period}</span>}
                  </div>
                  <p className="mt-1 text-xs text-white/30">{plan.description}</p>
                </div>

                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-white/50">
                      <span className="mt-0.5 text-sky-400">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={isCurrent}
                  className={[
                    "w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    isCurrent
                      ? "cursor-default bg-white/[0.04] text-white/25"
                      : plan.highlight
                        ? "bg-sky-500 text-white hover:bg-sky-400"
                        : "border border-white/[0.08] text-white/60 hover:bg-white/[0.05] hover:text-white/90",
                  ].join(" ")}
                >
                  {isCurrent ? "Plan actuel" : plan.id === "enterprise" ? "Nous contacter" : "Passer à ce plan"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getUserSubscription, checkUsageLimit } from "@/lib/subscription";
import BillingPlansClient from "@/app/_components/BillingPlansClient";

export const metadata: Metadata = { title: "Facturation" };

type PlanId = "starter" | "pro" | "scale";

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
    price: "49 €",
    period: "/ mois",
    description: "Pour les agents indépendants.",
    features: [
      "30 annonces IA / mois",
      "10 analyses de marché",
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
      "150 annonces IA / mois",
      "50 analyses de marché",
      "Support prioritaire",
      "Jusqu'à 5 utilisateurs",
    ],
    highlight: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "199 €",
    period: "/ mois",
    description: "Pour les grands réseaux immobiliers.",
    features: [
      "Annonces & analyses illimitées",
      "15 utilisateurs",
      "Support dédié",
      "Onboarding personnalisé",
    ],
    highlight: false,
  },
];

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const [subscription, listingsUsage, analysesUsage] = await Promise.all([
    getUserSubscription(userId),
    checkUsageLimit(userId, "listings"),
    checkUsageLimit(userId, "analyses"),
  ]);

  const currentPlan = (subscription?.plan ?? "starter") as PlanId;

  const statusLabel =
    subscription?.status === "active"   ? "Actif"     :
    subscription?.status === "canceled" ? "Annulé"    :
    subscription?.status === "trialing" ? "Essai"     :
    subscription?.status === "past_due" ? "En retard" :
    "Inactif";

  const renewalDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const usageItems = [
    {
      label: "Annonces IA",
      used:  listingsUsage.used,
      limit: listingsUsage.limit,
    },
    {
      label: "Analyses marché",
      used:  analysesUsage.used,
      limit: analysesUsage.limit,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Facturation</h1>
        <p className="mt-1 text-sm text-white/40">Gérez votre abonnement et vos paiements.</p>
      </div>

      {/* Plan actuel */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0f0f13] p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/25">Plan actuel</p>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-xl font-semibold text-white capitalize">{currentPlan}</p>
              <span className="badge">{statusLabel}</span>
            </div>
            {renewalDate && (
              <p className="mt-1 text-sm text-white/40">
                Prochain renouvellement le <strong className="text-white/60">{renewalDate}</strong>
              </p>
            )}
          </div>
          <a
            href="https://billing.stripe.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/[0.05] hover:text-white/90"
          >
            Gérer sur Stripe →
          </a>
        </div>

        {/* Usage du mois */}
        <div className="mt-6 grid grid-cols-2 gap-6 border-t border-white/[0.06] pt-5">
          {usageItems.map((item) => {
            const isUnlimited = item.limit === -1;
            const pct = isUnlimited
              ? 0
              : Math.min(Math.round((item.used / item.limit) * 100), 100);

            return (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-white/40">{item.label}</span>
                  <span className="tabular-nums text-white/60">
                    {isUnlimited ? `${item.used} utilisées` : `${item.used} / ${item.limit}`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-white/40"
                    style={{ width: isUnlimited ? "0%" : `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Changer de plan */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-white/90">Changer de plan</h2>
        <BillingPlansClient plans={PLANS} currentPlan={currentPlan} />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

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

interface Props {
  plans: Plan[];
  currentPlan: PlanId | "none";
}

export default function BillingPlansClient({ plans, currentPlan }: Props) {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(planId: PlanId) {
    setLoadingPlan(planId);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const json = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !json.url) {
        setError(json.error ?? "Erreur lors de la création de la session.");
        setLoadingPlan(null);
        return;
      }

      window.location.href = json.url;
    } catch {
      setError("Impossible de joindre le serveur.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white/60">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const isLoading = loadingPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={[
                "relative flex flex-col rounded-xl border p-6 transition-colors",
                plan.highlight
                  ? "border-white/20 bg-white/[0.03]"
                  : "border-white/[0.06] bg-[#0f0f13]",
              ].join(" ")}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge">
                  Populaire
                </span>
              )}

              <div className="mb-4">
                <p className="text-[13px] font-semibold text-white/60">{plan.name}</p>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-white/30">{plan.period}</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-white/30">{plan.description}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-white/50">
                    <span className="mt-0.5 text-white/30">–</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isCurrent || loadingPlan !== null}
                onClick={() => handleCheckout(plan.id)}
                className={[
                  "w-full",
                  isCurrent
                    ? "rounded-lg cursor-default bg-white/[0.04] text-white/20 px-4 py-2.5 text-sm"
                    : plan.highlight
                      ? "btn-primary"
                      : "btn-secondary",
                  loadingPlan !== null && !isCurrent ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
              >
                {isCurrent
                  ? "Plan actuel"
                  : isLoading
                    ? "Redirection…"
                    : "Choisir ce plan"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

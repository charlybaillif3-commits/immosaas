import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const user = await currentUser();
  const firstName = user?.firstName ?? "là";

  const stats: Array<{ label: string; value: string; delta: string }> = [
    { label: "Annonces actives",    value: "24",     delta: "+3 ce mois"    },
    { label: "Vues totales",        value: "1 842",  delta: "+12% vs mois"  },
    { label: "Leads reçus",         value: "37",     delta: "+5 cette sem." },
    { label: "Crédits IA restants", value: "58",     delta: "42 utilisés"   },
  ];

  return (
    <div className="space-y-8">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Bonjour, {firstName}
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Voici un aperçu de votre activité aujourd&apos;hui.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-accent px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-medium text-white/40">
              {stat.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Section récente */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Dernières annonces */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f13]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-semibold text-white/90">Annonces récentes</h2>
            <a href="/listings" className="text-xs text-white/40 hover:text-white/80 transition-colors">
              Voir tout →
            </a>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {[
              { title: "Appartement T3 – Paris 15e", price: "485 000 €", status: "active" },
              { title: "Maison 5 pièces – Lyon 6e",  price: "620 000 €", status: "draft"  },
              { title: "Studio meublé – Bordeaux",   price: "185 000 €", status: "active" },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between px-5 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-white/80">{item.title}</p>
                  <p className="text-[11px] text-white/35">{item.price}</p>
                </div>
                <span className={[
                  "ml-3 shrink-0 badge",
                  item.status === "active" ? "badge-green" : "badge-gray",
                ].join(" ")}>
                  {item.status === "active" ? "Active" : "Brouillon"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activité IA */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f13]">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-semibold text-white/90">Activité IA récente</h2>
            <a href="/history" className="text-xs text-white/40 hover:text-white/80 transition-colors">
              Historique →
            </a>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {[
              { action: "Annonce générée",    detail: "Appartement Paris 15e",  tokens: "420 tokens", ago: "Il y a 2h"  },
              { action: "Analyse de marché",  detail: "Lyon 6e – Appartements", tokens: "810 tokens", ago: "Il y a 5h"  },
              { action: "Annonce générée",    detail: "Maison Lyon 6e",         tokens: "395 tokens", ago: "Hier"       },
            ].map((item) => (
              <div key={`${item.action}-${item.ago}`} className="flex items-start gap-3 px-5 py-3.5">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.06]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3 h-3 text-white/40" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-white/80">{item.action}</p>
                  <p className="text-[11px] text-white/35 truncate">{item.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] text-white/30">{item.tokens}</p>
                  <p className="text-[10px] text-white/20">{item.ago}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

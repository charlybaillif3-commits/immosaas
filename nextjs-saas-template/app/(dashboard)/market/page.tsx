import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MarketAnalyzerForm from "@/components/market/MarketAnalyzerForm";

export const metadata: Metadata = { title: "Market Analyzer" };

export default async function MarketPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Market Analyzer
          </h1>
          <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-400">
            IA
          </span>
        </div>
        <p className="mt-1 text-sm text-white/40">
          Analyse instantanée du marché immobilier local — score, prix médian, tendance et stratégie de prix.
        </p>
      </div>

      {/* Formulaire + Résultats */}
      <div className="rounded-xl border border-white/[0.06] bg-[#0d0d14] p-6">
        <MarketAnalyzerForm />
      </div>
    </div>
  );
}

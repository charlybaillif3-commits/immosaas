import type { Metadata } from "next";
import MarketAnalyzerForm from "@/components/market/MarketAnalyzerForm";
import MarketChart from "@/components/market/MarketChart";

/**
 * app/(dashboard)/market/page.tsx — Analyseur de marché immobilier
 *
 * Rôle : outil d'analyse des prix par zone géographique.
 * - L'utilisateur saisit une ville/code postal et un type de bien.
 * - MarketAnalyzerForm (Client Component) appelle la route /api/market/analyze
 *   qui agrège les données Supabase et demande à l'IA une analyse narrative.
 * - MarketChart affiche l'évolution des prix au m² sur 12 mois (Recharts).
 */

export const metadata: Metadata = {
  title: "Analyseur de marché",
};

export default function MarketPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analyseur de marché</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Obtenez une analyse IA des prix immobiliers par secteur géographique.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MarketAnalyzerForm />
        </div>
        <div className="lg:col-span-2">
          <MarketChart />
        </div>
      </div>
    </div>
  );
}

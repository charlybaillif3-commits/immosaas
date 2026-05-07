"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketAnalysis } from "@/lib/openai";

/**
 * components/market/MarketAnalyzerForm.tsx — Formulaire d'analyse de marché
 *
 * Rôle : saisie des paramètres et affichage du rapport IA.
 * - Appelle la Route Handler POST /api/market/analyze.
 * - L'analyse inclut une narration IA et des recommandations pour l'agence.
 * - Le composant frère MarketChart reçoit les données via props (state lifting).
 *   Pour simplifier, les données sont affichées directement ici.
 */

const PROPERTY_TYPES = [
  { value: "apartment", label: "Appartement" },
  { value: "house",     label: "Maison" },
  { value: "land",      label: "Terrain" },
  { value: "commercial",label: "Local commercial" },
] as const;

const TREND_LABELS = {
  rising:   { label: "En hausse",   color: "text-green-600" },
  stable:   { label: "Stable",      color: "text-blue-600" },
  declining:{ label: "En baisse",   color: "text-red-600" },
};

export default function MarketAnalyzerForm() {
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState<"apartment" | "house" | "land" | "commercial">("apartment");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await fetch("/api/market/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, propertyType }),
    });

    const data = (await res.json()) as { success: boolean; data?: MarketAnalysis; error?: string };

    if (!res.ok || !data.success) {
      setError(data.error ?? "Erreur lors de l'analyse.");
      setIsLoading(false);
      return;
    }

    setAnalysis(data.data!);
    setIsLoading(false);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Paramètres</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <Input
              label="Ville ou secteur"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Lyon, Bordeaux Chartrons…"
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Type de bien</label>
              <select
                className="input-base"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as typeof propertyType)}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              {isLoading ? "Analyse en cours…" : "Analyser"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Rapport IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {analysis.averagePricePerSqm.toLocaleString("fr-FR")} €/m²
                </p>
                <p className="text-xs text-muted-foreground">Prix moyen estimé</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${TREND_LABELS[analysis.trend].color}`}>
                  {TREND_LABELS[analysis.trend].label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {analysis.trendPercent > 0 ? "+" : ""}
                  {analysis.trendPercent.toFixed(1)}% sur 12 mois
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              {analysis.narrative}
            </p>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Recommandations
              </p>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm">· {rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

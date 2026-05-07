"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * components/market/MarketChart.tsx — Graphique d'évolution des prix
 *
 * Rôle : visualisation de l'évolution du prix au m² sur 12 mois.
 * - En production, intégrer Recharts ou Chart.js pour le graphique.
 * - Ce composant est un placeholder montrant la structure attendue.
 * - Les données arrivent via un contexte partagé ou prop drilling depuis
 *   la page parente après l'analyse (pattern à implémenter avec Zustand ou Context).
 *
 * Pour intégrer Recharts :
 *   pnpm add recharts
 *   import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
 */

export default function MarketChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Évolution des prix au m²</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-64 items-center justify-center rounded-md border-2 border-dashed border-muted text-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Graphique Recharts
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Installez recharts puis remplacez ce placeholder
              par un &lt;LineChart&gt; avec les données de l&apos;analyse.
            </p>
            <pre className="mt-3 rounded bg-muted p-3 text-left text-xs">
{`import { LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer } from "recharts"

<ResponsiveContainer width="100%" height={256}>
  <LineChart data={dataPoints}>
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Line dataKey="avg_price_per_sqm" />
  </LineChart>
</ResponsiveContainer>`}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

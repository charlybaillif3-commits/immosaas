import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * components/dashboard/StatsCard.tsx — Carte de KPI (Server Component)
 *
 * Rôle : affiche une métrique clé avec label, valeur et tendance optionnelle.
 * - Server Component pur : reçoit ses données en props, pas d'état.
 * - trend : variation positive (vert) ou négative (rouge) en %.
 */

interface StatsCardProps {
  label: string;
  value: number;
  icon: "home" | "list" | "eye" | "users";
  trend?: string;
}

const ICON_MAP: Record<StatsCardProps["icon"], string> = {
  home:  "🏠",
  list:  "📋",
  eye:   "👁",
  users: "👥",
};

export default function StatsCard({ label, value, icon, trend }: StatsCardProps) {
  const isPositive = trend?.startsWith("+");

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <span className="text-2xl" aria-hidden>{ICON_MAP[icon]}</span>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium",
                isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value.toLocaleString("fr-FR")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

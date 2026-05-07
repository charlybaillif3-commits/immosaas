import * as React from "react";
import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/types";

/**
 * components/ui/badge.tsx — Composant Badge (étiquette de statut)
 *
 * Rôle : affiche un statut coloré sous forme de pill.
 * - Variantes génériques (default, success, warning, error, info).
 * - Helper ListingStatusBadge pour mapper les statuts métier aux couleurs.
 * - Server Component : pas d'interactivité, pas de "use client".
 */

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-secondary text-secondary-foreground",
  success: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  error:   "bg-red-100 text-red-800",
  info:    "bg-blue-100 text-blue-800",
  outline: "border border-border bg-transparent text-foreground",
};

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/* ── Helper métier ─────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<
  ListingStatus,
  { label: string; variant: BadgeVariant }
> = {
  draft:    { label: "Brouillon",  variant: "default"  },
  active:   { label: "Active",     variant: "success"  },
  sold:     { label: "Vendu",      variant: "info"     },
  rented:   { label: "Loué",       variant: "info"     },
  archived: { label: "Archivée",   variant: "outline"  },
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

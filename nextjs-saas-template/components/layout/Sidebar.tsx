"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * components/layout/Sidebar.tsx — Navigation latérale (Client Component)
 *
 * Rôle : barre de navigation fixe à gauche de l'application.
 * - "use client" requis pour usePathname() qui détecte la route active.
 * - Chaque item de navigation est un lien Next.js (prefetch automatique).
 * - La classe "active" est appliquée dynamiquement selon la route courante.
 */

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: "⬛" },
  { href: "/listings", label: "Mes annonces",      icon: "🏠" },
  { href: "/market",   label: "Marché",            icon: "📊" },
  { href: "/settings", label: "Paramètres",        icon: "⚙️" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-bold text-brand-700">ImmoSaaS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">ImmoSaaS v1.0</p>
      </div>
    </aside>
  );
}

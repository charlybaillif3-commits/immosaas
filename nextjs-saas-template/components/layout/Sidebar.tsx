"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconSparkles } from "@/components/layout/icons";
import { NAV_ITEMS } from "@/lib/nav-items";

/**
 * components/layout/Sidebar.tsx — Navigation latérale (Client Component)
 *
 * "use client" requis pour usePathname() qui détecte la route active.
 * NAV_ITEMS importé depuis lib/nav-items.ts (source unique partagée avec MobileSidebar).
 */

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || (href !== "/listings" && pathname.startsWith(href));
  }

  return (
    <aside className="flex w-64 flex-col bg-[#0d0d14] border-r border-white/[0.06]">

      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/[0.06] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15">
          <IconSparkles className="w-4 h-4 text-indigo-400" aria-hidden />
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-white">
          Propstack
        </span>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/25">
          Navigation
        </p>

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                active
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "text-white/50 hover:bg-white/[0.04] hover:text-white/90",
              ].join(" ")}
            >
              {/* Indicateur actif */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-indigo-400" />
              )}

              <Icon
                className={[
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  active ? "text-indigo-400" : "text-white/35 group-hover:text-white/70",
                ].join(" ")}
                aria-hidden
              />

              <span className="flex-1 truncate">{item.label}</span>

              {item.badge && (
                <span className="rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 ring-1 ring-indigo-500/20">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer — plan de l'agence */}
      <div className="shrink-0 border-t border-white/[0.06] px-4 py-4">
        <div className="rounded-lg bg-white/[0.03] px-3 py-3 ring-1 ring-white/[0.06]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-white/60">Plan actuel</p>
            <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-400">
              Pro
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] text-white/35 mb-1">
              <span>Crédits IA</span>
              <span>42 / 100</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[42%] rounded-full bg-indigo-500" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

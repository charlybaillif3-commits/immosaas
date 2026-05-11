"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconMenu, IconX, IconSparkles } from "@/components/layout/icons";
import { NAV_ITEMS } from "@/lib/nav-items";

/**
 * components/layout/MobileSidebar.tsx — Sidebar mobile (Client Component)
 *
 * Drawer overlay pour les écrans < lg.
 * NAV_ITEMS importé depuis lib/nav-items.ts (source unique partagée avec Sidebar).
 */

export default function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Bouton toggle — visible uniquement en mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-lg p-2 text-white/50 hover:bg-white/[0.06] hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <IconMenu className="w-5 h-5" aria-hidden />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Drawer */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#0d0d14] border-r border-white/[0.06]",
          "transform transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15">
              <IconSparkles className="w-4 h-4 text-sky-400" aria-hidden />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-white">Propstack</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/[0.06] hover:text-white/80"
            aria-label="Fermer le menu"
          >
            <IconX className="w-5 h-5" aria-hidden />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={[
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-sky-500/10 text-sky-400"
                    : "text-white/50 hover:bg-white/[0.04] hover:text-white/90",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-sky-400" />
                )}
                <Icon
                  className={["w-[18px] h-[18px] shrink-0", active ? "text-sky-400" : "text-white/35"].join(" ")}
                  aria-hidden
                />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge && (
                  <span className="rounded-md bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400 ring-1 ring-sky-500/20">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

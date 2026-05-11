"use client";

import { useRef, useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { IconChevronDown, IconUser, IconCog, IconLogOut } from "@/components/layout/icons";

/**
 * components/layout/UserMenu.tsx — Menu déroulant utilisateur (Client Component)
 *
 * - useUser() de Clerk : accès aux infos de l'utilisateur connecté côté client.
 * - Dropdown fermé au clic extérieur via useRef + useEffect.
 * - Aucune lib UI externe : dropdown entièrement en Tailwind + state React.
 * - SignOutButton de Clerk gère la déconnexion proprement.
 */

export default function UserMenu() {
  const { user, isLoaded } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isLoaded || !user) {
    return (
      <div className="h-8 w-32 animate-pulse rounded-lg bg-white/[0.06]" />
    );
  }

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const displayName = user.fullName ?? user.firstName ?? email.split("@")[0];
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Avatar */}
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={displayName}
            className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-semibold text-indigo-400 ring-1 ring-indigo-500/30">
            {initials}
          </span>
        )}

        <div className="hidden flex-col items-start sm:flex">
          <span className="max-w-[120px] truncate text-[13px] font-medium text-white/90">
            {displayName}
          </span>
        </div>

        <IconChevronDown
          className={[
            "w-3.5 h-3.5 text-white/30 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right animate-[fadeIn_0.12s_ease-out] rounded-xl border border-white/[0.08] bg-[#111118] shadow-2xl shadow-black/40 ring-1 ring-black/10">

          {/* User info */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-[13px] font-medium text-white/90 truncate">{displayName}</p>
            <p className="text-[11px] text-white/40 truncate mt-0.5">{email}</p>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white/90"
            >
              <IconUser className="w-4 h-4 text-white/30" aria-hidden />
              Mon profil
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white/90"
            >
              <IconCog className="w-4 h-4 text-white/30" aria-hidden />
              Paramètres
            </button>
          </div>

          {/* Separator */}
          <div className="border-t border-white/[0.06] p-1.5">
            <SignOutButton>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-red-400/80 transition-colors hover:bg-red-500/[0.06] hover:text-red-400"
              >
                <IconLogOut className="w-4 h-4" aria-hidden />
                Déconnexion
              </button>
            </SignOutButton>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRef, useState, useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { IconChevronDown, IconUser, IconCog, IconLogOut } from "@/components/layout/icons";

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
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={displayName}
            className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08] text-[11px] font-semibold text-white/70 ring-1 ring-white/10">
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

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right animate-[fadeIn_0.12s_ease-out] rounded-xl border border-white/[0.08] bg-[#0f0f13] shadow-2xl shadow-black/40">

          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-[13px] font-medium text-white/90 truncate">{displayName}</p>
            <p className="text-[11px] text-white/40 truncate mt-0.5">{email}</p>
          </div>

          <div className="p-1.5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/90"
            >
              <IconUser className="w-4 h-4 text-white/25" aria-hidden />
              Mon profil
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-white/50 transition-colors hover:bg-white/[0.04] hover:text-white/90"
            >
              <IconCog className="w-4 h-4 text-white/25" aria-hidden />
              Paramètres
            </button>
          </div>

          <div className="border-t border-white/[0.06] p-1.5">
            <SignOutButton>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/60"
              >
                <IconLogOut className="w-4 h-4 text-white/25" aria-hidden />
                Déconnexion
              </button>
            </SignOutButton>
          </div>
        </div>
      )}
    </div>
  );
}

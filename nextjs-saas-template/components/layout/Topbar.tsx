import UserMenu from "@/components/layout/UserMenu";
import MobileSidebar from "@/components/layout/MobileSidebar";
import { IconBell } from "@/components/layout/icons";

/**
 * components/layout/Topbar.tsx — Barre de navigation supérieure
 *
 * Server Component : ne gère pas d'état, pas de "use client".
 * - MobileSidebar : Client Component (bouton + drawer overlay mobile).
 * - UserMenu : Client Component (dropdown avec useUser() Clerk).
 * - Les deux sont des îlots d'interactivité dans un Server Component.
 */

export default function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0d0d14] px-4 sm:px-6">

      {/* Gauche : bouton menu mobile */}
      <div className="flex items-center gap-3">
        <MobileSidebar />
      </div>

      {/* Droite : actions + user */}
      <div className="flex items-center gap-1.5">

        {/* Bouton notifications */}
        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50"
          aria-label="Notifications"
        >
          <IconBell className="w-[18px] h-[18px]" aria-hidden />
          {/* Indicateur non-lus */}
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-sky-400 ring-2 ring-[#0d0d14]" />
        </button>

        {/* Séparateur */}
        <div className="mx-1.5 h-5 w-px bg-white/[0.08]" />

        {/* Menu utilisateur Clerk */}
        <UserMenu />
      </div>
    </header>
  );
}

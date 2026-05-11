import UserMenu from "@/components/layout/UserMenu";
import MobileSidebar from "@/components/layout/MobileSidebar";
import { IconBell } from "@/components/layout/icons";

export default function Topbar() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#080810] px-4 sm:px-6">

      <div className="flex items-center gap-3">
        <MobileSidebar />
      </div>

      <div className="flex items-center gap-1.5">

        <button
          type="button"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          aria-label="Notifications"
        >
          <IconBell className="w-[18px] h-[18px]" aria-hidden />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-white/50 ring-2 ring-[#080810]" />
        </button>

        <div className="mx-1.5 h-5 w-px bg-white/[0.08]" />

        <UserMenu />
      </div>
    </header>
  );
}

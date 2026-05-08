import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

/**
 * app/(dashboard)/layout.tsx — Layout principal de l'application
 *
 * Server Component. Structure :
 * - Sidebar fixe à gauche (visible sur lg+, cachée sur mobile)
 * - Colonne droite : Topbar fixe en haut + zone de contenu scrollable
 * - Le fond global est dark (#080810) pour le dark mode du SaaS
 * - Les groupes de routes (dashboard) n'ajoutent pas de segment URL
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#080810]">

      {/* Sidebar — masquée sur mobile (gérée par MobileSidebar dans Topbar) */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Colonne principale */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar />

        {/* Zone de contenu */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

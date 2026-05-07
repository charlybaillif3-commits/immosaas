import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

/**
 * app/(dashboard)/layout.tsx — Layout principal de l'application
 *
 * Rôle : structure commune à toutes les pages authentifiées.
 * - Groupe de routes (dashboard) sans segment URL : les routes restent
 *   /dashboard, /listings, /market, etc.
 * - Compose la Sidebar (navigation fixe à gauche) et la Topbar (en-tête).
 * - Le children est la zone de contenu dynamique de chaque page.
 * - Server Component : peut lire les cookies/session directement.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="page-container animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}

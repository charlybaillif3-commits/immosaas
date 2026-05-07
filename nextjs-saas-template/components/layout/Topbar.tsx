import { createServerClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

/**
 * components/layout/Topbar.tsx — En-tête de l'application (Server Component)
 *
 * Rôle : barre horizontale en haut de chaque page authentifiée.
 * - Server Component : lit la session Supabase directement sans état client.
 * - Affiche l'email de l'utilisateur connecté.
 * - LogoutButton est un Client Component isolé pour le seul bouton interactif.
 *   Pattern "Client Component dans Server Component" pour minimiser le JS bundle.
 */

export default async function Topbar() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {user?.email}
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}

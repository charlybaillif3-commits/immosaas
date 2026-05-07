import { currentUser } from "@clerk/nextjs/server";
import LogoutButton from "@/components/auth/LogoutButton";

/**
 * components/layout/Topbar.tsx — En-tête de l'application (Server Component)
 *
 * Rôle : barre horizontale en haut de chaque page authentifiée.
 * - currentUser() de Clerk récupère l'utilisateur connecté côté serveur.
 *   Remplace supabase.auth.getUser() — Supabase n'est plus utilisé pour l'auth.
 * - LogoutButton est un Client Component isolé pour le seul bouton interactif.
 */

export default async function Topbar() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{email}</span>
        <LogoutButton />
      </div>
    </header>
  );
}

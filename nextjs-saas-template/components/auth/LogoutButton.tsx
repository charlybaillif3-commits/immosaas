"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * components/auth/LogoutButton.tsx — Bouton de déconnexion (Client Component)
 *
 * Rôle : déclenche la déconnexion Supabase depuis le navigateur.
 * - Isolé en Client Component pour garder Topbar.tsx en Server Component.
 * - Après déconnexion, redirige vers /login et rafraîchit le cache Next.js.
 */

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleLogout}>
      Déconnexion
    </Button>
  );
}

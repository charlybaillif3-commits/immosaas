"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

/**
 * components/auth/LogoutButton.tsx — Bouton de déconnexion Clerk
 *
 * Rôle : déclenche la déconnexion via Clerk.
 * - SignOutButton de Clerk gère la suppression de la session côté client et serveur.
 * - Après déconnexion, Clerk redirige automatiquement vers la page de connexion.
 * - Marqué "use client" car SignOutButton est un composant interactif.
 */

export default function LogoutButton() {
  return (
    <SignOutButton>
      <Button variant="outline" size="sm">
        Déconnexion
      </Button>
    </SignOutButton>
  );
}

import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

/**
 * app/(auth)/sign-in/[[...sign-in]]/page.tsx — Page de connexion Clerk
 *
 * Rôle : affiche le composant de connexion Clerk.
 * - La route catch-all [[...sign-in]] est requise par Clerk pour gérer
 *   ses propres sous-routes internes (OAuth callbacks, MFA, etc.).
 * - Le composant <SignIn /> est entièrement géré par Clerk :
 *   email/password, Google, GitHub, magic link selon votre config dashboard.
 * - L'URL de cette page doit correspondre à NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in.
 */

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace agence ImmoSaaS.",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 px-4">
      <div className="flex flex-col items-center gap-6 animate-slide-up">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-700">ImmoSaaS</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Plateforme IA pour agences immobilières
          </p>
        </div>
        <SignIn />
      </div>
    </main>
  );
}

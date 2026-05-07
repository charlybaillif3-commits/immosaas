import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

/**
 * app/(auth)/sign-up/[[...sign-up]]/page.tsx — Page d'inscription Clerk
 *
 * Rôle : affiche le composant d'inscription Clerk.
 * - La route catch-all [[...sign-up]] est requise par Clerk.
 * - L'URL doit correspondre à NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up.
 * - Après inscription, Clerk redirige vers NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard.
 */

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre espace agence ImmoSaaS.",
};

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 px-4">
      <div className="flex flex-col items-center gap-6 animate-slide-up">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-700">ImmoSaaS</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Créez votre espace agence
          </p>
        </div>
        <SignUp />
      </div>
    </main>
  );
}

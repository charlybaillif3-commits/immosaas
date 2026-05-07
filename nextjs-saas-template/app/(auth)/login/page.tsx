import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

/**
 * app/(auth)/login/page.tsx — Page de connexion
 *
 * Rôle : point d'entrée pour les utilisateurs non authentifiés.
 * - Le groupe de routes (auth) n'ajoute PAS de segment URL : la route est /login.
 * - LoginForm est un Client Component (marqué "use client") pour gérer
 *   les états du formulaire et appeler supabase.auth.signInWithPassword().
 * - Le middleware redirige vers /dashboard si déjà connecté.
 */

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace agence ImmoSaaS.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-brand-700">ImmoSaaS</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Plateforme IA pour agences immobilières
          </p>
        </div>
        <div className="card-base">
          <h2 className="mb-6 text-xl font-semibold">Connexion</h2>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

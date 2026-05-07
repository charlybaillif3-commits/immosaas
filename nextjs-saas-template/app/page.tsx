import { redirect } from "next/navigation";

/**
 * app/page.tsx — Page racine "/"
 *
 * Rôle : simple redirecteur.
 * Dans un SaaS B2B, la racine n'a pas de contenu propre :
 * - Si connecté → dashboard (géré par middleware.ts)
 * - Si non connecté → page de login
 * Pour une landing page marketing, remplacer redirect() par le JSX de la page.
 */
export default function RootPage() {
  redirect("/login");
}

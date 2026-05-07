import { redirect } from "next/navigation";

/**
 * app/page.tsx — Page racine "/"
 *
 * Redirige vers la page de connexion Clerk (/sign-in).
 * Le middleware protège les routes /dashboard, /listings, etc.
 * et redirige lui-même les utilisateurs non connectés vers /sign-in.
 */
export default function RootPage() {
  redirect("/sign-in");
}

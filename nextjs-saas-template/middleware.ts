import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * middleware.ts — Authentification & protection des routes via Clerk
 *
 * Rôle : intercepte chaque requête avant qu'elle atteigne les routes Next.js.
 * - clerkMiddleware() gère automatiquement le refresh des tokens Clerk.
 * - createRouteMatcher() définit les routes qui nécessitent une session active.
 * - auth.protect() redirige vers NEXT_PUBLIC_CLERK_SIGN_IN_URL si non connecté.
 * - Les routes non listées dans isProtectedRoute sont publiques par défaut.
 */

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/listings(.*)",
  "/market(.*)",
  "/settings(.*)",
  "/agency(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

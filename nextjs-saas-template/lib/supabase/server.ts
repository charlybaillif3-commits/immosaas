import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * lib/supabase/server.ts — Client Supabase côté serveur
 *
 * Rôle : instance Supabase pour les Server Components, Server Actions
 *        et Route Handlers.
 * - Utilise next/headers (cookies) pour lire/écrire la session.
 * - La fonction est async car cookies() est async dans Next.js 14+.
 * - Ne jamais importer ce fichier dans un Client Component (erreur de build).
 * - Préférer la clé SERVICE_ROLE uniquement dans les Route Handlers admin
 *   qui nécessitent de contourner les RLS Supabase.
 *
 * Variables d'environnement requises (.env.local) :
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...  (admin uniquement)
 */
export async function createServerClient() {
  const cookieStore = await cookies();

  return createSupabaseServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Les Server Components ne peuvent pas set les cookies.
            // Le middleware.ts s'en charge automatiquement.
          }
        },
      },
    }
  );
}

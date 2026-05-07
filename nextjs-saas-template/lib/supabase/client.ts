import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * lib/supabase/client.ts — Client Supabase côté navigateur
 *
 * Rôle : instance Supabase pour les Client Components ("use client").
 * - Utilise @supabase/ssr qui gère automatiquement les cookies de session
 *   dans le navigateur (remplace l'ancien createClient de @supabase/auth-helpers).
 * - À utiliser dans les composants interactifs (formulaires, boutons, etc.)
 *   qui tournent côté client.
 * - La fonction est appelée à chaque rendu : createBrowserClient mémoïse
 *   l'instance pour éviter les doublons.
 *
 * Variables d'environnement requises (.env.local) :
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * lib/supabase/admin.ts — Client Supabase avec service_role_key
 *
 * Rôle : client admin pour les API Routes et Server Actions qui ont besoin
 *        d'écrire en base sans passer par RLS.
 * - Ne jamais exposer ce client côté client (Client Components).
 * - Utilise SUPABASE_SERVICE_ROLE_KEY — jamais ANON_KEY ici.
 * - Aucune référence à auth.users : Clerk gère l'authentification.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Variables manquantes : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

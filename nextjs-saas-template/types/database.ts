/**
 * types/database.ts — Types Supabase auto-générés
 *
 * Rôle : interface TypeScript qui correspond exactement au schéma de votre
 *        base de données Supabase.
 * - En production, ce fichier est généré automatiquement via :
 *     npx supabase gen types typescript --project-id <id> > types/database.ts
 * - Il sert de paramètre générique au client Supabase :
 *     createBrowserClient<Database>(...)
 * - Ne jamais éditer manuellement — toujours régénérer depuis la CLI.
 *
 * Le type ci-dessous est une version simplifiée pour démarrer.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          plan: "starter" | "pro" | "enterprise";
          owner_id: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["agencies"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["agencies"]["Insert"]>;
      };
      listings: {
        Row: {
          id: string;
          agency_id: string;
          title: string;
          description: string;
          highlights: string[];
          property_type: "apartment" | "house" | "land" | "commercial" | "parking";
          surface: number;
          rooms: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          price: number;
          price_per_sqm: number;
          address: string;
          city: string;
          postal_code: string;
          latitude: number | null;
          longitude: number | null;
          status: "draft" | "active" | "sold" | "rented" | "archived";
          features: string[];
          images: string[];
          views_count: number;
          ai_generated: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["listings"]["Row"], "id" | "price_per_sqm" | "views_count" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["listings"]["Insert"]>;
      };
      leads: {
        Row: {
          id: string;
          agency_id: string;
          listing_id: string | null;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          message: string | null;
          status: "new" | "contacted" | "qualified" | "lost" | "converted";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leads"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };
      market_data: {
        Row: {
          id: string;
          city: string;
          postal_code: string;
          property_type: "apartment" | "house" | "land" | "commercial";
          avg_price_per_sqm: number;
          transaction_count: number;
          month: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["market_data"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["market_data"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

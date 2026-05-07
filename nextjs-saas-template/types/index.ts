/**
 * types/index.ts — Types TypeScript de domaine
 *
 * Rôle : source de vérité pour tous les types métier de l'application.
 * - Séparé des types Supabase auto-générés (types/database.ts).
 * - Ces types représentent les entités manipulées dans les composants React
 *   et les Server Actions.
 * - Utiliser "export type" (pas d'exports de valeurs ici).
 */

/* ── Agence ─────────────────────────────────────────────────────────── */

export type AgencyPlan = "starter" | "pro" | "enterprise";

export type Agency = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  plan: AgencyPlan;
  owner_id: string;
  created_at: string;
  updated_at: string;
  settings: AgencySettings;
};

export type AgencySettings = {
  default_tone: "professional" | "friendly" | "luxury";
  listings_per_month_limit: number;
  market_analyzer_enabled: boolean;
  ai_credits_remaining: number;
};

/* ── Annonces (Listings) ─────────────────────────────────────────────── */

export type PropertyType =
  | "apartment"
  | "house"
  | "land"
  | "commercial"
  | "parking";

export type ListingStatus = "draft" | "active" | "sold" | "rented" | "archived";

export type Listing = {
  id: string;
  agency_id: string;
  title: string;
  description: string;
  highlights: string[];
  property_type: PropertyType;
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
  status: ListingStatus;
  features: string[];
  images: string[];
  views_count: number;
  ai_generated: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateListingInput = Omit<
  Listing,
  "id" | "agency_id" | "price_per_sqm" | "views_count" | "created_at" | "updated_at" | "published_at"
>;

export type UpdateListingInput = Partial<CreateListingInput> & { id: string };

/* ── Marché immobilier ──────────────────────────────────────────────── */

export type MarketDataPoint = {
  month: string;
  avg_price_per_sqm: number;
  transaction_count: number;
  city: string;
  property_type: PropertyType;
};

export type MarketReport = {
  id: string;
  agency_id: string;
  location: string;
  property_type: PropertyType;
  average_price_per_sqm: number;
  trend: "rising" | "stable" | "declining";
  trend_percent: number;
  narrative: string;
  recommendations: string[];
  data_points: MarketDataPoint[];
  generated_at: string;
};

/* ── Leads ──────────────────────────────────────────────────────────── */

export type LeadStatus = "new" | "contacted" | "qualified" | "lost" | "converted";

export type Lead = {
  id: string;
  agency_id: string;
  listing_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  message: string | null;
  status: LeadStatus;
  created_at: string;
};

/* ── Utilisateurs / Membres d'agence ───────────────────────────────── */

export type UserRole = "owner" | "agent" | "admin";

export type AgencyMember = {
  id: string;
  agency_id: string;
  user_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
};

/* ── API responses ──────────────────────────────────────────────────── */

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

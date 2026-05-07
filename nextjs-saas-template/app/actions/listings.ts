"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  generateListingContent,
  ListingInputSchema,
  type ListingInput,
} from "@/lib/openai";

/**
 * app/actions/listings.ts — Server Actions pour les annonces
 *
 * Rôle : fonctions serveur appelées directement depuis les Client Components.
 * - "use server" : Next.js les compile en endpoints POST sécurisés.
 * - auth() de Clerk vérifie la session — remplace supabase.auth.getUser().
 * - Supabase est utilisé uniquement comme base de données (pas pour l'auth).
 * - revalidatePath() invalide le cache Next.js après mutation.
 */

/* ── Générer le contenu IA d'une annonce ──────────────────────────── */

export async function generateListingAction(input: ListingInput) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false as const, error: "Non authentifié." };
  }

  const parsed = ListingInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false as const,
      error: "Données invalides : " + parsed.error.issues.map((i) => i.message).join(", "),
    };
  }

  try {
    const generated = await generateListingContent(parsed.data);
    return { success: true as const, data: generated };
  } catch {
    return { success: false as const, error: "Erreur lors de la génération IA." };
  }
}

/* ── Créer une annonce ────────────────────────────────────────────── */

const CreateListingSchema = z.object({
  title: z.string().min(10).max(200),
  description: z.string().min(50).max(5000),
  highlights: z.array(z.string()).max(10),
  property_type: z.enum(["apartment", "house", "land", "commercial", "parking"]),
  surface: z.number().positive(),
  rooms: z.number().int().positive().nullable(),
  bedrooms: z.number().int().positive().nullable(),
  bathrooms: z.number().int().positive().nullable(),
  price: z.number().positive(),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  postal_code: z.string().regex(/^\d{5}$/),
  features: z.array(z.string()).max(30),
  ai_generated: z.boolean(),
  status: z.enum(["draft", "active"]).default("draft"),
});

export async function createListingAction(formData: unknown) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false as const, error: "Non authentifié." };
  }

  const parsed = CreateListingSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
    };
  }

  const supabase = await createServerClient();

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("owner_id", userId)
    .single();

  if (!agency) {
    return { success: false as const, error: "Agence introuvable." };
  }

  const surface = parsed.data.surface;
  const price = parsed.data.price;

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      ...parsed.data,
      agency_id: agency.id,
      price_per_sqm: Math.round(price / surface),
      latitude: null,
      longitude: null,
      images: [],
      views_count: 0,
      published_at: parsed.data.status === "active" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false as const, error: "Erreur lors de la création." };
  }

  revalidatePath("/listings");
  redirect(`/listings/${listing.id}`);
}

/* ── Supprimer une annonce ────────────────────────────────────────── */

export async function deleteListingAction(listingId: string) {
  const { userId } = await auth();

  if (!userId) {
    return { success: false as const, error: "Non authentifié." };
  }

  const supabase = await createServerClient();

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("owner_id", userId)
    .single();

  if (!agency) {
    return { success: false as const, error: "Agence introuvable." };
  }

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("agency_id", agency.id);

  if (error) {
    return { success: false as const, error: "Suppression impossible." };
  }

  revalidatePath("/listings");
  return { success: true as const };
}

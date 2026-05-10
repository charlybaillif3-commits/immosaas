import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";
import ListingsClient from "@/components/listings/ListingsClient";

export const metadata: Metadata = { title: "Annonces" };

export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

export default async function ListingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createAdminClient();

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("agency_id")
    .eq("id", userId)
    .single();

  const profile = profileRaw as { agency_id: string | null } | null;

  if (!profile?.agency_id) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-sm text-white/40">
          Aucune agence associée à votre compte.
        </p>
      </div>
    );
  }

  const { data: listingsRaw } = await supabase
    .from("listings")
    .select(
      "id, agency_id, title, description, property_type, surface, rooms, price, city, postal_code, status, ai_generated, created_at"
    )
    .eq("agency_id", profile.agency_id)
    .order("created_at", { ascending: false })
    .limit(200);

  const listings = (listingsRaw ?? []) as Pick<
    ListingRow,
    | "id"
    | "agency_id"
    | "title"
    | "description"
    | "property_type"
    | "surface"
    | "rooms"
    | "price"
    | "city"
    | "postal_code"
    | "status"
    | "ai_generated"
    | "created_at"
  >[];

  return <ListingsClient initialListings={listings} />;
}

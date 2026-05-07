import type { Metadata } from "next";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import ListingsTable from "@/components/listings/ListingsTable";
import { Button } from "@/components/ui/button";

/**
 * app/(dashboard)/listings/page.tsx — Liste des annonces de l'agence
 *
 * Rôle : affiche toutes les annonces immobilières de l'agence.
 * - Server Component avec fetch Supabase direct.
 * - Le tri et la pagination peuvent être gérés via searchParams (URL params).
 * - Le bouton "Nouvelle annonce" renvoie vers /listings/new où l'IA génère le texte.
 */

export const metadata: Metadata = {
  title: "Mes annonces",
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: agency } = await supabase
    .from("agencies")
    .select("id")
    .eq("owner_id", user!.id)
    .single();

  const page = Number(searchParams.page ?? 1);
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("agency_id", agency?.id ?? "")
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  const { data: listings, count } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mes annonces</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {count ?? 0} annonce{(count ?? 0) > 1 ? "s" : ""} au total
          </p>
        </div>
        <Button asChild>
          <Link href="/listings/new">+ Nouvelle annonce IA</Link>
        </Button>
      </div>

      <ListingsTable listings={listings ?? []} total={count ?? 0} page={page} pageSize={pageSize} />
    </div>
  );
}

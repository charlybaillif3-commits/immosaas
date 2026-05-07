import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListingStatusBadge } from "@/components/ui/badge";
import { formatPrice, formatSurface, formatRelativeDate } from "@/lib/utils";

/**
 * components/dashboard/RecentListings.tsx — Liste des dernières annonces
 *
 * Rôle : affiche les 5 annonces les plus récentes de l'agence.
 * - Server Component avec fetch Supabase direct (pas d'API route intermédiaire).
 * - Utilisé dans le dashboard pour une vue rapide de l'activité.
 * - Chaque ligne est cliquable vers le détail de l'annonce.
 */

export default async function RecentListings({ agencyId }: { agencyId: string }) {
  const supabase = await createServerClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("id, title, property_type, surface, price, status, created_at, city")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!listings || listings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Annonces récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucune annonce pour le moment.{" "}
            <Link href="/listings/new" className="text-brand-600 underline-offset-4 hover:underline">
              Créer la première
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Annonces récentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{listing.title}</p>
                <p className="text-xs text-muted-foreground">
                  {listing.city} · {formatSurface(listing.surface)} · {formatPrice(listing.price)}
                </p>
              </div>
              <div className="ml-4 flex items-center gap-3 shrink-0">
                <ListingStatusBadge status={listing.status as never} />
                <span className="text-xs text-muted-foreground">
                  {formatRelativeDate(listing.created_at)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

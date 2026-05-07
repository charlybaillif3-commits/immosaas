"use client";

import Link from "next/link";
import { ListingStatusBadge } from "@/components/ui/badge";
import { formatPrice, formatSurface, formatRelativeDate } from "@/lib/utils";
import type { Listing } from "@/types";

/**
 * components/listings/ListingsTable.tsx — Tableau des annonces (Client Component)
 *
 * Rôle : affiche la liste paginée des annonces sous forme de table.
 * - "use client" pour les interactions futures (tri, sélection multiple).
 * - Reçoit les données déjà fetchées depuis le Server Component parent (listings/page.tsx).
 * - Chaque ligne renvoie vers le détail /listings/[id].
 */

type ListingRow = Pick<
  Listing,
  "id" | "title" | "property_type" | "surface" | "price" | "city" | "status" | "created_at" | "ai_generated"
>;

interface ListingsTableProps {
  listings: ListingRow[];
  total: number;
  page: number;
  pageSize: number;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Appartement",
  house:     "Maison",
  land:      "Terrain",
  commercial:"Local comm.",
  parking:   "Parking",
};

export default function ListingsTable({ listings, total, page, pageSize }: ListingsTableProps) {
  const totalPages = Math.ceil(total / pageSize);

  if (listings.length === 0) {
    return (
      <div className="card-base flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">Aucune annonce trouvée</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Créez votre première annonce avec l&apos;IA.
        </p>
        <Link href="/listings/new" className="mt-4 text-sm text-brand-600 hover:underline">
          + Nouvelle annonce IA
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Annonce</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Surface</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Créée</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/listings/${listing.id}`} className="hover:underline">
                    <p className="font-medium line-clamp-1">{listing.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {listing.city}
                      {listing.ai_generated && (
                        <span className="ml-2 text-brand-500">· IA</span>
                      )}
                    </p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {PROPERTY_TYPE_LABELS[listing.property_type] ?? listing.property_type}
                </td>
                <td className="px-4 py-3">{formatSurface(listing.surface)}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(listing.price)}</td>
                <td className="px-4 py-3">
                  <ListingStatusBadge status={listing.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatRelativeDate(listing.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Page {page} sur {totalPages} ({total} annonces)</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={`?page=${page - 1}`} className="rounded border px-3 py-1 hover:bg-muted">
                Précédent
              </Link>
            )}
            {page < totalPages && (
              <Link href={`?page=${page + 1}`} className="rounded border px-3 py-1 hover:bg-muted">
                Suivant
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

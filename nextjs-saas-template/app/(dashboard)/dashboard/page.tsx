import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentListings from "@/components/dashboard/RecentListings";

/**
 * app/(dashboard)/dashboard/page.tsx — Tableau de bord principal
 *
 * Rôle : vue d'ensemble de l'activité de l'agence.
 * - Server Component : fetche les données directement depuis Supabase
 *   sans passer par une API route (plus rapide, plus simple).
 * - Affiche KPIs (annonces actives, vues, leads) et annonces récentes.
 */

export const metadata: Metadata = {
  title: "Tableau de bord",
};

async function getDashboardStats(agencyId: string) {
  const supabase = await createServerClient();

  const [listingsResult, leadsResult] = await Promise.all([
    supabase
      .from("listings")
      .select("id, status, views_count")
      .eq("agency_id", agencyId),
    supabase
      .from("leads")
      .select("id, created_at")
      .eq("agency_id", agencyId)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const listings = listingsResult.data ?? [];
  const leads = leadsResult.data ?? [];

  return {
    totalListings: listings.length,
    activeListings: listings.filter((l) => l.status === "active").length,
    totalViews: listings.reduce((sum, l) => sum + (l.views_count ?? 0), 0),
    leadsThisMonth: leads.length,
  };
}

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: agency } = await supabase
    .from("agencies")
    .select("id, name")
    .eq("owner_id", user!.id)
    .single();

  const stats = agency ? await getDashboardStats(agency.id) : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Bonjour, {agency?.name ?? "votre agence"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Voici un aperçu de votre activité ce mois-ci.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard label="Annonces actives" value={stats.activeListings} icon="home" />
          <StatsCard label="Total annonces" value={stats.totalListings} icon="list" />
          <StatsCard label="Vues totales" value={stats.totalViews} icon="eye" trend="+12%" />
          <StatsCard label="Leads (30j)" value={stats.leadsThisMonth} icon="users" trend="+5%" />
        </div>
      )}

      <RecentListings agencyId={agency?.id ?? ""} />
    </div>
  );
}

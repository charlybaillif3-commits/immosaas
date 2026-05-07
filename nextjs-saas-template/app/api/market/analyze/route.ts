import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@/lib/supabase/server";
import { analyzeMarket, MarketQuerySchema } from "@/lib/openai";

/**
 * app/api/market/analyze/route.ts — Route Handler : analyse de marché
 *
 * Rôle : endpoint POST qui combine données Supabase + analyse IA.
 * - Vérifie l'authentification via Supabase SSR.
 * - Récupère les transactions récentes en base pour la zone demandée.
 * - Appelle analyzeMarket() (OpenAI) avec ces données contextuelles.
 * - Sauvegarde le rapport en base pour un historique consultable.
 *
 * Route : POST /api/market/analyze
 * Body  : { location: string, propertyType: string, surfaceRange?: {min, max} }
 */

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const parsed = MarketQuerySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 422 }
    );
  }

  const { location, propertyType } = parsed.data;

  const { data: marketData } = await supabase
    .from("market_data")
    .select("avg_price_per_sqm, transaction_count, month")
    .ilike("city", `%${location}%`)
    .eq("property_type", propertyType)
    .order("month", { ascending: false })
    .limit(24);

  const comparables = (marketData ?? []).map((d) => ({
    price: d.avg_price_per_sqm * 60,
    surface: 60,
    date: d.month,
  }));

  try {
    const analysis = await analyzeMarket(parsed.data, comparables);

    const { data: agency } = await supabase
      .from("agencies")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (agency) {
      await supabase.from("market_reports" as never).insert({
        agency_id: agency.id,
        location,
        property_type: propertyType,
        ...analysis,
        data_points: marketData ?? [],
        generated_at: new Date().toISOString(),
      } as never);
    }

    return NextResponse.json({ success: true, data: analysis });
  } catch (err) {
    console.error("[market/analyze]", err);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse IA." },
      { status: 500 }
    );
  }
}

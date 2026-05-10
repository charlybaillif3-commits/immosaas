import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

/* ── Schémas Zod ────────────────────────────────────────────────────── */

const PropertyTypeSchema = z.enum([
  "apartment",
  "house",
  "land",
  "commercial",
  "parking",
]);

const BodySchema = z.object({
  city:          z.string().min(1).max(100),
  district:      z.string().max(100).optional(),
  property_type: PropertyTypeSchema,
  price_min:     z.number().positive().optional(),
  price_max:     z.number().positive().optional(),
});

const MarketAnalysisSchema = z.object({
  score_marche:             z.number().min(1).max(10),
  prix_median_m2:           z.number().positive(),
  tendance:                 z.enum(["haussiere", "stable", "baissiere"]),
  delai_vente_moyen:        z.string().min(1),
  recommandations_pricing:  z.array(z.string().min(1)).length(3),
  arguments_vente:          z.array(z.string().min(1)).length(3),
  synthese:                 z.string().min(1),
});

export type MarketAnalysis = z.infer<typeof MarketAnalysisSchema>;

/* ── Labels ─────────────────────────────────────────────────────────── */

const PROPERTY_LABELS: Record<string, string> = {
  apartment:  "appartement",
  house:      "maison",
  land:       "terrain",
  commercial: "local commercial",
  parking:    "parking",
};

/* ── Handler ────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Données invalides.", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const input = parsed.data;

  const supabase = createAdminClient();
  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("agency_id, id")
    .eq("id", userId)
    .single();

  const profile = profileRaw as { id: string; agency_id: string | null } | null;

  if (!profile?.agency_id) {
    return NextResponse.json({ success: false, error: "Profil ou agence introuvable." }, { status: 404 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "Clé Anthropic manquante." }, { status: 500 });
  }

  const locationLabel = input.district
    ? `${input.city} — ${input.district}`
    : input.city;

  const priceContext = input.price_min && input.price_max
    ? `Fourchette de prix : ${input.price_min.toLocaleString("fr-FR")} € — ${input.price_max.toLocaleString("fr-FR")} €`
    : input.price_min
    ? `Prix minimum : ${input.price_min.toLocaleString("fr-FR")} €`
    : input.price_max
    ? `Prix maximum : ${input.price_max.toLocaleString("fr-FR")} €`
    : "";

  const prompt = `Tu es un expert en analyse du marché immobilier français, spécialisé dans l'évaluation des tendances locales et la stratégie de prix.

Analyse le marché immobilier pour :
- Localisation : ${locationLabel}
- Type de bien : ${PROPERTY_LABELS[input.property_type] ?? input.property_type}
${priceContext ? `- ${priceContext}` : ""}

Produis une analyse professionnelle basée sur ta connaissance du marché immobilier français.
Utilise des données réalistes et cohérentes pour cette zone géographique.

Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans commentaire, sans explication :
{
  "score_marche": <nombre entre 1 et 10, attractivité globale du marché>,
  "prix_median_m2": <prix médian réaliste au m² en euros, nombre entier>,
  "tendance": <"haussiere" | "stable" | "baissiere">,
  "delai_vente_moyen": <"X à Y semaines" ou "X mois" — délai réaliste>,
  "recommandations_pricing": [
    "<recommandation 1 sur la stratégie de prix, 1-2 phrases>",
    "<recommandation 2>",
    "<recommandation 3>"
  ],
  "arguments_vente": [
    "<argument fort pour valoriser ce type de bien dans cette zone, 1 phrase>",
    "<argument 2>",
    "<argument 3>"
  ],
  "synthese": "<paragraphe de synthèse de 80-120 mots, ton professionnel, état du marché, opportunités et points de vigilance>"
}`;

  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type":      "application/json",
      "x-api-key":         apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model:      "claude-haiku-4-5",
      max_tokens: 1024,
      messages:   [{ role: "user", content: prompt }],
    }),
  });

  if (!anthropicResponse.ok) {
    const err = await anthropicResponse.text();
    console.error("Anthropic error:", err);
    return NextResponse.json({ success: false, error: "Erreur Anthropic." }, { status: 502 });
  }

  const anthropicData = await anthropicResponse.json();
  const rawText: string = anthropicData?.content?.[0]?.text ?? "";

  let analysis: MarketAnalysis;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    analysis = MarketAnalysisSchema.parse(JSON.parse(jsonMatch[0]));
  } catch {
    return NextResponse.json(
      { success: false, error: "Réponse IA invalide.", raw: rawText },
      { status: 502 }
    );
  }

  void supabase.from("market_analyses").insert({
    agency_id:       profile.agency_id,
    city:            input.city,
    postal_code:     "",
    property_type:   input.property_type,
    avg_price_sqm:   analysis.prix_median_m2,
    trend:           analysis.tendance,
    trend_percent:   null,
    narrative:       analysis.synthese,
    recommendations: analysis.recommandations_pricing,
    data:            {
      district:              input.district ?? null,
      score_marche:          analysis.score_marche,
      delai_vente_moyen:     analysis.delai_vente_moyen,
      arguments_vente:       analysis.arguments_vente,
      price_min:             input.price_min ?? null,
      price_max:             input.price_max ?? null,
      tokens_used:           (anthropicData?.usage?.output_tokens as number | undefined) ?? 0,
    } satisfies Record<string, unknown>,
  });

  void supabase.from("ai_usage").insert({
    agency_id:   profile.agency_id,
    user_id:     userId,
    action_type: "analyze_market",
    tokens_used: (anthropicData?.usage?.output_tokens as number | undefined) ?? 0,
    model:       "claude-haiku-4-5",
    metadata:    { city: input.city, propertyType: input.property_type } satisfies Record<string, unknown>,
  });

  return NextResponse.json({ success: true, data: analysis });
}

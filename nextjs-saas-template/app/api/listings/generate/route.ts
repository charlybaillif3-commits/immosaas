import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const PropertyTypeSchema = z.enum([
  "apartment",
  "house", 
  "land",
  "commercial",
  "parking",
]);

const BodySchema = z.object({
  property_type: PropertyTypeSchema,
  surface: z.number().positive(),
  rooms: z.number().int().positive(),
  price: z.number().positive(),
  city: z.string().min(1),
  postal_code: z.string().min(1),
  highlights: z.string().optional(),
});

const GeneratedContentSchema = z.object({
  titre: z.string(),
  description: z.string(),
  points_forts: z.array(z.string()).length(5),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ success: false, error: "Non authentifié." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Données invalides.", details: parsed.error.flatten() }, { status: 422 });
  }

  const input = parsed.data;

  const supabase = createAdminClient();
  const { data: profileRaw, error: profileError } = await supabase
    .from("profiles")
    .select("agency_id, id")
    .eq("id", userId)
    .single();

  const profile = profileRaw as { id: string; agency_id: string | null } | null;

  if (profileError || !profile || !profile.agency_id) {
    return NextResponse.json({ success: false, error: "Profil ou agence introuvable." }, { status: 404 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "Clé Anthropic manquante." }, { status: 500 });
  }

  const propertyLabels: Record<string, string> = {
    apartment: "appartement",
    house: "maison",
    land: "terrain",
    commercial: "local commercial",
    parking: "parking",
  };

  const prompt = `Tu es un expert en immobilier français. Génère une annonce immobilière professionnelle et attractive.

Bien : ${propertyLabels[input.property_type] ?? input.property_type}
Surface : ${input.surface} m²
Pièces : ${input.rooms}
Prix : ${input.price.toLocaleString("fr-FR")} €
Ville : ${input.city} (${input.postal_code})
${input.highlights ? `Points forts mentionnés par l'agent : ${input.highlights}` : ""}

Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans explication :
{
  "titre": "titre accrocheur de 60-80 caractères",
  "description": "description complète de 200-300 mots, professionnelle et séduisante",
  "points_forts": ["point 1", "point 2", "point 3", "point 4", "point 5"]
}`;

  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!anthropicResponse.ok) {
    const err = await anthropicResponse.text();
    console.error("Anthropic error:", err);
    return NextResponse.json({ success: false, error: "Erreur Anthropic." }, { status: 502 });
  }

  const anthropicData = await anthropicResponse.json();
  const rawText = anthropicData?.content?.[0]?.text ?? "";

  let generated: z.infer<typeof GeneratedContentSchema>;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    generated = GeneratedContentSchema.parse(JSON.parse(jsonMatch[0]));
  } catch {
    return NextResponse.json({ success: false, error: "Réponse IA invalide.", raw: rawText }, { status: 502 });
  }

  void supabase.from("ai_usage").insert({
    agency_id: profile.agency_id as string,
    user_id: userId,
    action_type: "generate_listing" as const,
    tokens_used: ((anthropicData?.usage?.output_tokens) as number | undefined) ?? 0,
    model: "claude-3-5-haiku-20241022",
    metadata: { city: input.city, propertyType: input.property_type } as Record<string, unknown>,
  });

  return NextResponse.json({
    success: true,
    data: {
      titre: generated.titre,
      description: generated.description,
      points_forts: generated.points_forts,
    },
    agencyId: profile.agency_id,
  });
}

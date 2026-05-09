import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * app/api/listings/generate/route.ts — Génération d'annonce via Anthropic Claude
 *
 * POST /api/listings/generate
 *
 * Flux :
 *  1. Vérifie la session Clerk (auth())
 *  2. Valide le body avec Zod
 *  3. Récupère l'agencyId depuis la table profiles
 *  4. Appelle Anthropic claude-3-5-haiku via fetch() natif
 *  5. Parse la réponse JSON structurée
 *  6. Retourne le contenu généré (la sauvegarde est confirmée par le client)
 *
 * Aucun SDK Anthropic — fetch() uniquement.
 * Aucun supabase.auth — Clerk gère l'authentification.
 */

/* ── Types ──────────────────────────────────────────────────────────── */

const PropertyTypeSchema = z.enum([
  "apartment",
  "house",
  "land",
  "commercial",
  "parking",
]);

const GenerateRequestSchema = z.object({
  propertyType: PropertyTypeSchema,
  surface:      z.number().positive(),
  rooms:        z.number().int().positive().nullable(),
  bedrooms:     z.number().int().nonnegative().nullable(),
  price:        z.number().positive(),
  city:         z.string().min(2).max(100),
  postalCode:   z.string().regex(/^\d{5}$/, "Code postal invalide"),
  highlights:   z.array(z.string().min(2)).min(1).max(10),
});

const GeneratedContentSchema = z.object({
  titre:        z.string().min(10),
  description:  z.string().min(50),
  points_forts: z.array(z.string()).length(5),
});

interface AnthropicContentBlock {
  type:  string;
  text?: string;
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
  error?: { message: string };
}

export type GenerateRequest  = z.infer<typeof GenerateRequestSchema>;
export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment:  "appartement",
  house:      "maison",
  land:       "terrain",
  commercial: "local commercial",
  parking:    "parking",
};

/* ── Handler ────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  /* 1. Authentification Clerk */
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Non authentifié." },
      { status: 401 }
    );
  }

  /* 2. Validation du body */
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Corps de requête JSON invalide." },
      { status: 400 }
    );
  }

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(", "),
      },
      { status: 422 }
    );
  }

  const input = parsed.data;

  /* 3. Récupération de l'agencyId */
  const supabase = createAdminClient();
  const { data: profileRaw, error: profileError } = await supabase
    .from("profiles")
    .select("agency_id, id")
    .eq("id", userId)
    .single();

  if (profileError || !profile?.agency_id) {
    return NextResponse.json(
      { success: false, error: "Profil ou agence introuvable." },
      { status: 404 }
    );
  }

  /* 4. Vérification env Anthropic */
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Clé API Anthropic non configurée." },
      { status: 500 }
    );
  }

  /* 5. Construction du prompt */
  const propertyLabel = PROPERTY_TYPE_LABELS[input.propertyType] ?? input.propertyType;
  const roomsText     = input.rooms    ? `${input.rooms} pièces` : "pièces non précisées";
  const bedroomsText  = input.bedrooms ? `${input.bedrooms} chambres` : "";
  const priceFormatted = new Intl.NumberFormat("fr-FR").format(input.price);

  const prompt = `Tu es un expert en marketing immobilier français. Génère une annonce professionnelle et percutante pour un bien immobilier.

Caractéristiques du bien :
- Type : ${propertyLabel}
- Surface : ${input.surface} m²
- Pièces : ${roomsText}${bedroomsText ? ` dont ${bedroomsText}` : ""}
- Prix : ${priceFormatted} €
- Localisation : ${input.city} (${input.postalCode})
- Points forts mentionnés par l'agent : ${input.highlights.join(", ")}

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans bloc de code Markdown :
{
  "titre": "titre accrocheur de 60-80 caractères maximum",
  "description": "description complète de 200-350 mots, fluide, professionnelle, qui donne envie de visiter",
  "points_forts": ["point 1", "point 2", "point 3", "point 4", "point 5"]
}

Règles importantes :
- Le titre ne doit pas commencer par le type de bien seul
- La description doit créer une projection émotionnelle pour l'acheteur
- Les 5 points forts doivent être concis (max 8 mots chacun) et commerciaux
- Adapte le ton au type de bien (luxe pour les biens > 500 000€, chaleureux pour les maisons, dynamique pour les appartements)
- Écris uniquement en français`;

  /* 6. Appel Anthropic via fetch() natif */
  let anthropicRes: Response;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type":    "application/json",
        "x-api-key":       apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-3-5-haiku-20241022",
        max_tokens: 1200,
        messages: [
          { role: "user", content: prompt },
        ],
      }),
    });
  } catch (fetchError) {
    console.error("[generate] fetch Anthropic failed", fetchError);
    return NextResponse.json(
      { success: false, error: "Impossible de joindre l'API Anthropic." },
      { status: 502 }
    );
  }

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text().catch(() => "inconnu");
    console.error("[generate] Anthropic error", anthropicRes.status, errText);
    return NextResponse.json(
      { success: false, error: `Erreur Anthropic (${anthropicRes.status}).` },
      { status: 502 }
    );
  }

  /* 7. Parse de la réponse Anthropic */
  let anthropicData: AnthropicResponse;
  try {
    anthropicData = (await anthropicRes.json()) as AnthropicResponse;
  } catch {
    return NextResponse.json(
      { success: false, error: "Réponse Anthropic illisible." },
      { status: 502 }
    );
  }

  const rawText = anthropicData.content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("");

  if (!rawText) {
    return NextResponse.json(
      { success: false, error: "Réponse Anthropic vide." },
      { status: 502 }
    );
  }

  /* 8. Parse du JSON structuré retourné par Claude */
  let generated: GeneratedContent;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Aucun objet JSON trouvé dans la réponse");

    const rawParsed = JSON.parse(jsonMatch[0]) as unknown;
    const validated = GeneratedContentSchema.safeParse(rawParsed);

    if (!validated.success) {
      throw new Error(
        validated.error.issues.map((i) => i.message).join(", ")
      );
    }
    generated = validated.data;
  } catch (parseError) {
    console.error("[generate] JSON parse error", parseError, rawText);
    return NextResponse.json(
      { success: false, error: "La réponse IA n'était pas au format attendu." },
      { status: 502 }
    );
  }

  /* 9. Journaliser l'usage IA (non bloquant) */
  supabase
    .from("ai_usage")
    .insert({
      agency_id:   profile.agency_id,
      user_id:     userId,
      action_type: "generate_listing",
      tokens_used: 600,
      model:       "claude-3-5-haiku-20241022",
      metadata:    { city: input.city, property_type: input.propertyType },
    })
    .then(({ error }) => {
      if (error) console.error("[generate] ai_usage insert error", error);
    });

  /* 10. Succès */
  return NextResponse.json({
    success:  true,
    data:     generated,
    agencyId: profile.agency_id,
  });
}

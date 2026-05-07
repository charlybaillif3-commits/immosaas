import OpenAI from "openai";
import { z } from "zod";

/**
 * lib/openai.ts — Client OpenAI + helpers métier
 *
 * Rôle : centralise tous les appels OpenAI de l'application.
 * - Instance unique du client (singleton).
 * - Fonctions métier typées : generateListingContent() et analyzeMarket().
 * - Validation des entrées avec Zod pour éviter les injections de prompt.
 * - À utiliser UNIQUEMENT côté serveur (Server Actions, Route Handlers).
 *   La clé API ne doit jamais être exposée au navigateur.
 *
 * Variable d'environnement requise (.env.local) :
 *   OPENAI_API_KEY=sk-...
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ── Schémas de validation ────────────────────────────────────────── */

export const ListingInputSchema = z.object({
  propertyType: z.enum(["apartment", "house", "land", "commercial", "parking"]),
  surface: z.number().positive().max(10000),
  rooms: z.number().int().positive().max(50).optional(),
  price: z.number().positive(),
  location: z.string().min(2).max(100),
  features: z.array(z.string().max(50)).max(20).optional(),
  tone: z.enum(["professional", "friendly", "luxury"]).default("professional"),
});

export type ListingInput = z.infer<typeof ListingInputSchema>;

export const MarketQuerySchema = z.object({
  location: z.string().min(2).max(100),
  propertyType: z.enum(["apartment", "house", "land", "commercial"]),
  surfaceRange: z
    .object({ min: z.number(), max: z.number() })
    .optional(),
});

export type MarketQuery = z.infer<typeof MarketQuerySchema>;

/* ── Génération d'annonces ────────────────────────────────────────── */

export interface GeneratedListing {
  title: string;
  description: string;
  highlights: string[];
}

export async function generateListingContent(
  input: ListingInput
): Promise<GeneratedListing> {
  const validated = ListingInputSchema.parse(input);

  const featuresText =
    validated.features && validated.features.length > 0
      ? `Caractéristiques : ${validated.features.join(", ")}.`
      : "";

  const toneInstruction = {
    professional: "Ton professionnel et factuel.",
    friendly:     "Ton chaleureux et accueillant.",
    luxury:       "Ton élégant, haut de gamme, vocabulaire riche.",
  }[validated.tone];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Tu es un expert en rédaction d'annonces immobilières françaises.
Génère des annonces percutantes, précises et optimisées pour les portails immobiliers.
${toneInstruction}
Réponds UNIQUEMENT en JSON avec les clés : title (string), description (string, 150-250 mots), highlights (string[], 3-5 points forts).`,
      },
      {
        role: "user",
        content: `Crée une annonce pour :
- Type : ${validated.propertyType}
- Surface : ${validated.surface} m²
- Pièces : ${validated.rooms ?? "N/A"}
- Prix : ${validated.price.toLocaleString("fr-FR")} €
- Localisation : ${validated.location}
${featuresText}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as GeneratedListing;

  return {
    title: parsed.title ?? "",
    description: parsed.description ?? "",
    highlights: parsed.highlights ?? [],
  };
}

/* ── Analyse de marché ────────────────────────────────────────────── */

export interface MarketAnalysis {
  averagePricePerSqm: number;
  trend: "rising" | "stable" | "declining";
  trendPercent: number;
  narrative: string;
  recommendations: string[];
}

export async function analyzeMarket(
  query: MarketQuery,
  comparables: { price: number; surface: number; date: string }[]
): Promise<MarketAnalysis> {
  const validated = MarketQuerySchema.parse(query);

  const comparablesText =
    comparables.length > 0
      ? comparables
          .map(
            (c) =>
              `${c.price.toLocaleString("fr-FR")} € / ${c.surface} m² (${c.date})`
          )
          .join("\n")
      : "Aucune donnée comparable disponible.";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `Tu es un analyste du marché immobilier français.
Analyse les données fournies et produis un rapport structuré.
Réponds en JSON avec : averagePricePerSqm (number), trend ("rising"|"stable"|"declining"),
trendPercent (number, variation en %), narrative (string, 100-150 mots), recommendations (string[], 3 conseils).`,
      },
      {
        role: "user",
        content: `Analyse le marché pour :
- Zone : ${validated.location}
- Type de bien : ${validated.propertyType}
- Transactions récentes :
${comparablesText}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as MarketAnalysis;
}

export default openai;

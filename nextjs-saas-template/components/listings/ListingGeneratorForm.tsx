"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateListingAction, createListingAction } from "@/app/actions/listings";
import type { GeneratedListing } from "@/lib/openai";

/**
 * components/listings/ListingGeneratorForm.tsx — Générateur IA d'annonces
 *
 * Rôle : formulaire en deux étapes pour créer une annonce avec l'IA.
 * Étape 1 — Saisie des caractéristiques du bien par l'agent.
 * Étape 2 — Affichage du contenu généré par l'IA, éditable avant publication.
 * - Appelle generateListingAction() (Server Action) pour la génération IA.
 * - Appelle createListingAction() (Server Action) pour la sauvegarde en base.
 */

type Step = "input" | "preview";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Appartement" },
  { value: "house",     label: "Maison" },
  { value: "land",      label: "Terrain" },
  { value: "commercial",label: "Local commercial" },
  { value: "parking",   label: "Parking" },
] as const;

const TONES = [
  { value: "professional", label: "Professionnel" },
  { value: "friendly",     label: "Chaleureux" },
  { value: "luxury",       label: "Luxe" },
] as const;

export default function ListingGeneratorForm() {
  const [step, setStep] = useState<Step>("input");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedListing | null>(null);

  const [form, setForm] = useState({
    propertyType: "apartment" as const,
    surface: "",
    rooms: "",
    price: "",
    location: "",
    tone: "professional" as const,
    features: "",
    address: "",
    city: "",
    postal_code: "",
  });

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    const result = await generateListingAction({
      propertyType: form.propertyType,
      surface: Number(form.surface),
      rooms: form.rooms ? Number(form.rooms) : undefined,
      price: Number(form.price),
      location: form.location,
      tone: form.tone,
      features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
    });

    if (!result.success) {
      setError(result.error);
      setIsGenerating(false);
      return;
    }

    setGenerated(result.data);
    setStep("preview");
    setIsGenerating(false);
  }

  async function handleSave(status: "draft" | "active") {
    if (!generated) return;
    setIsSaving(true);

    await createListingAction({
      title: generated.title,
      description: generated.description,
      highlights: generated.highlights,
      property_type: form.propertyType,
      surface: Number(form.surface),
      rooms: form.rooms ? Number(form.rooms) : null,
      bedrooms: null,
      bathrooms: null,
      price: Number(form.price),
      address: form.address,
      city: form.city,
      postal_code: form.postal_code,
      features: form.features.split(",").map((f) => f.trim()).filter(Boolean),
      ai_generated: true,
      status,
    });
  }

  if (step === "preview" && generated) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Annonce générée par l&apos;IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Titre</p>
              <p className="text-lg font-semibold">{generated.title}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Description</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{generated.description}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Points forts</p>
              <ul className="space-y-1">
                {generated.highlights.map((h, i) => (
                  <li key={i} className="text-sm">· {h}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setStep("input")}>
            Modifier les données
          </Button>
          <Button variant="secondary" isLoading={isSaving} onClick={() => handleSave("draft")}>
            Enregistrer (brouillon)
          </Button>
          <Button isLoading={isSaving} onClick={() => handleSave("active")}>
            Publier l&apos;annonce
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleGenerate} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}

      <Card>
        <CardHeader><CardTitle>Caractéristiques du bien</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Type de bien</label>
              <select
                className="input-base"
                value={form.propertyType}
                onChange={(e) => update("propertyType", e.target.value)}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Ton de l&apos;annonce</label>
              <select
                className="input-base"
                value={form.tone}
                onChange={(e) => update("tone", e.target.value)}
              >
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label="Surface (m²)" type="number" value={form.surface} onChange={(e) => update("surface", e.target.value)} required min="1" />
            <Input label="Pièces" type="number" value={form.rooms} onChange={(e) => update("rooms", e.target.value)} min="1" />
            <Input label="Prix (€)" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} required min="1" />
          </div>

          <Input label="Localisation (ville / quartier)" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Paris 15e, Lyon Confluence…" required />
          <Input label="Adresse complète" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="12 rue de la Paix" required />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Ville" value={form.city} onChange={(e) => update("city", e.target.value)} required />
            <Input label="Code postal" value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} placeholder="75015" required pattern="\d{5}" />
          </div>

          <Input
            label="Caractéristiques (séparées par des virgules)"
            value={form.features}
            onChange={(e) => update("features", e.target.value)}
            placeholder="balcon, parking, cave, double vitrage…"
            hint="Optionnel — enrichit la génération IA"
          />
        </CardContent>
      </Card>

      <Button type="submit" isLoading={isGenerating} className="w-full">
        {isGenerating ? "L'IA génère votre annonce…" : "Générer l'annonce avec l'IA"}
      </Button>
    </form>
  );
}

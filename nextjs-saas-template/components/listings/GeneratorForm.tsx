"use client";

import { useState, useTransition } from "react";
import { createListingAction } from "@/app/actions/listings";

/**
 * components/listings/GeneratorForm.tsx — Formulaire de génération IA
 *
 * Flux en 3 étapes :
 *  1. "form"       : l'agent remplit les caractéristiques du bien
 *  2. "generating" : loader pendant l'appel Anthropic
 *  3. "preview"    : affichage du contenu généré + confirmation / édition
 *
 * - "use client" pour useState, useTransition, useRouter.
 * - Appel /api/listings/generate via fetch() natif.
 * - Sauvegarde via createListingAction (Server Action Next.js).
 * - Aucun any, aucun never — tous les types sont explicites.
 */

/* ── Types ──────────────────────────────────────────────────────────── */

type PropertyType   = "apartment" | "house" | "land" | "commercial" | "parking";
type ListingStyle   = "prestige" | "standard" | "coup_de_coeur";
type Step           = "form" | "generating" | "preview" | "saving";

interface FormValues {
  propertyType: PropertyType;
  style:        ListingStyle;
  surface:      string;
  rooms:        string;
  bedrooms:     string;
  price:        string;
  city:         string;
  postalCode:   string;
  highlights:   string;
}

interface GeneratedContent {
  titre:        string;
  description:  string;
  points_forts: string[];
}

interface ApiSuccessResponse {
  success:  true;
  data:     GeneratedContent;
  agencyId: string;
}

interface ApiErrorResponse {
  success: false;
  error:   string;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

/* ── Constantes ─────────────────────────────────────────────────────── */

const INPUT_CLS =
  "w-full rounded-lg border border-white/10 bg-[#0f0f13] px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/10 transition-colors";

const PROPERTY_TYPES: Array<{ value: PropertyType; label: string }> = [
  { value: "apartment",  label: "Appartement" },
  { value: "house",      label: "Maison" },
  { value: "land",       label: "Terrain" },
  { value: "commercial", label: "Local commercial" },
  { value: "parking",    label: "Parking" },
];

const LISTING_STYLES: Array<{ value: ListingStyle; label: string; desc: string }> = [
  { value: "prestige",      label: "Prestige",      desc: "Luxe & raffinement" },
  { value: "standard",      label: "Standard",      desc: "Clair & factuel" },
  { value: "coup_de_coeur", label: "Coup de cœur",  desc: "Émotion & storytelling" },
];

const INITIAL_FORM: FormValues = {
  propertyType: "apartment",
  style:        "standard",
  surface:      "",
  rooms:        "",
  bedrooms:     "",
  price:        "",
  city:         "",
  postalCode:   "",
  highlights:   "",
};

/* ── Composant ──────────────────────────────────────────────────────── */

export default function GeneratorForm() {
  const [step, setStep]           = useState<Step>("form");
  const [form, setForm]           = useState<FormValues>(INITIAL_FORM);
  const [generated, setGenerated] = useState<GeneratedContent | null>(null);
  const [agencyId, setAgencyId]   = useState<string>("");
  const [apiError, setApiError]   = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc,  setEditDesc]  = useState("");
  const [isPending, startTransition] = useTransition();

  /* ── Mise à jour d'un champ ─────────────────────────────────────── */

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ── Étape 1 → Génération ───────────────────────────────────────── */

  async function handleGenerate(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setApiError(null);

    const surface = parseFloat(form.surface);
    const price   = parseFloat(form.price);

    if (!form.surface || isNaN(surface) || surface <= 0) {
      setApiError("La surface est requise et doit être un nombre positif.");
      return;
    }
    if (!form.price || isNaN(price) || price <= 0) {
      setApiError("Le prix est requis et doit être un nombre positif.");
      return;
    }
    if (!form.city.trim()) {
      setApiError("La ville est requise.");
      return;
    }
    if (!/^\d{5}$/.test(form.postalCode.trim())) {
      setApiError("Le code postal doit contenir exactement 5 chiffres.");
      return;
    }

    setStep("generating");

    const highlightsList = form.highlights
      .split("\n")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    const payload = {
      property_type: form.propertyType,
      style:         form.style,
      surface:       parseFloat(form.surface),
      rooms:         form.rooms    ? parseInt(form.rooms, 10)    : null,
      bedrooms:      form.bedrooms ? parseInt(form.bedrooms, 10) : null,
      price:         parseFloat(form.price),
      city:          form.city.trim(),
      postal_code:   form.postalCode.trim(),
      highlights:    highlightsList.length > 0 ? highlightsList : ["Beau bien"],
    };

    let res: Response;
    try {
      res = await fetch("/api/listings/generate", {
        method:  "POST",
        headers: { "content-type": "application/json" },
        body:    JSON.stringify(payload),
      });
    } catch {
      setApiError("Impossible de joindre le serveur. Vérifiez votre connexion.");
      setStep("form");
      return;
    }

    let data: ApiResponse;
    try {
      data = (await res.json()) as ApiResponse;
    } catch {
      setApiError("Réponse serveur illisible.");
      setStep("form");
      return;
    }

    if (!data.success) {
      setApiError(data.error);
      setStep("form");
      return;
    }

    setGenerated(data.data);
    setAgencyId(data.agencyId);
    setEditTitle(data.data.titre);
    setEditDesc(data.data.description);
    setStep("preview");
  }

  /* ── Étape 2 → Sauvegarde ───────────────────────────────────────── */

  function handleSave(): void {
    if (!generated || !agencyId) return;
    setStep("saving");

    const highlightsList = form.highlights
      .split("\n")
      .map((h) => h.trim())
      .filter((h) => h.length > 0);

    const formData = {
      title:         editTitle,
      description:   editDesc,
      highlights:    generated.points_forts,
      property_type: form.propertyType,
      surface:       parseFloat(form.surface),
      rooms:         form.rooms    ? parseInt(form.rooms, 10)    : null,
      bedrooms:      form.bedrooms ? parseInt(form.bedrooms, 10) : null,
      bathrooms:     null,
      price:         parseFloat(form.price),
      address:       "",
      city:          form.city.trim(),
      postal_code:   form.postalCode.trim(),
      features:      highlightsList,
      ai_generated:  true,
      status:        "draft" as const,
    };

    startTransition(async () => {
      await createListingAction(formData);
    });
  }

  /* ── Render ─────────────────────────────────────────────────────── */

  if (step === "generating") {
    return <GeneratingLoader />;
  }

  if (step === "preview" && generated) {
    return (
      <Preview
        generated={generated}
        editTitle={editTitle}
        editDesc={editDesc}
        onTitleChange={setEditTitle}
        onDescChange={setEditDesc}
        onSave={handleSave}
        onReset={() => { setStep("form"); setGenerated(null); setApiError(null); }}
        isSaving={isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white/60">
          <strong>Erreur :</strong> {apiError}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-6">

        {/* Style de rédaction */}
        <FieldGroup label="Style de rédaction" hint="Choisissez le ton de la rédaction">
          <div className="grid grid-cols-3 gap-2">
            {LISTING_STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => update("style", s.value)}
                className={[
                  "flex flex-col items-center gap-0.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                  form.style === s.value
                    ? "border-white/25 bg-white/[0.08] text-white"
                    : "border-white/[0.08] bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/80",
                ].join(" ")}
              >
                <span className="text-[13px] font-semibold">{s.label}</span>
                <span className={[
                  "text-[10px]",
                  form.style === s.value ? "text-white/50" : "text-white/25",
                ].join(" ")}>
                  {s.desc}
                </span>
              </button>
            ))}
          </div>
        </FieldGroup>

        {/* Type de bien */}
        <FieldGroup label="Type de bien">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PROPERTY_TYPES.map((pt) => (
              <button
                key={pt.value}
                type="button"
                onClick={() => update("propertyType", pt.value)}
                className={[
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                  form.propertyType === pt.value
                    ? "border-white/25 bg-white/[0.08] text-white"
                    : "border-white/[0.08] bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/80",
                ].join(" ")}
              >
                {pt.label}
              </button>
            ))}
          </div>
        </FieldGroup>

        {/* Surface + Pièces */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FieldGroup label="Surface (m²)" required>
            <input
              type="number"
              value={form.surface}
              onChange={(e) => update("surface", e.target.value)}
              placeholder="85"
              min="1"
              step="0.5"
              required
              className={INPUT_CLS}
            />
          </FieldGroup>

          <FieldGroup label="Pièces">
            <input
              type="number"
              value={form.rooms}
              onChange={(e) => update("rooms", e.target.value)}
              placeholder="3"
              min="1"
              className={INPUT_CLS}
            />
          </FieldGroup>

          <FieldGroup label="Chambres">
            <input
              type="number"
              value={form.bedrooms}
              onChange={(e) => update("bedrooms", e.target.value)}
              placeholder="2"
              min="0"
              className={INPUT_CLS}
            />
          </FieldGroup>
        </div>

        {/* Prix */}
        <FieldGroup label="Prix de vente (€)" required>
          <div className="relative">
            <input
              type="number"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="ex : 285 000"
              required
              className={`${INPUT_CLS} pr-10`}
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-white/25">
              €
            </span>
          </div>
        </FieldGroup>

        {/* Localisation */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FieldGroup label="Ville" required className="sm:col-span-2">
            <input
              type="text"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Lyon"
              required
              className={INPUT_CLS}
            />
          </FieldGroup>

          <FieldGroup label="Code postal" required>
            <input
              type="text"
              value={form.postalCode}
              onChange={(e) => update("postalCode", e.target.value)}
              placeholder="69006"
              pattern="\d{5}"
              maxLength={5}
              required
              className={INPUT_CLS}
            />
          </FieldGroup>
        </div>

        {/* Points forts */}
        <FieldGroup
          label="Points forts"
          hint="Un point fort par ligne — l'IA s'en inspire pour rédiger l'annonce"
        >
          <textarea
            value={form.highlights}
            onChange={(e) => update("highlights", e.target.value)}
            placeholder={"Terrasse exposée sud\nDernière étage avec vue dégagée\nParking privatif\nProximité métro ligne 6"}
            rows={4}
            className={`${INPUT_CLS} resize-none`}
          />
        </FieldGroup>

        {/* Bouton générer */}
        <div className="pt-2">
          <button
            type="submit"
            className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
          >
            <SparkleIcon />
            Générer
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Sous-composants ────────────────────────────────────────────────── */

interface FieldGroupProps {
  label:     string;
  hint?:     string;
  required?: boolean;
  className?: string;
  children:  React.ReactNode;
}

function FieldGroup({ label, hint, required, className, children }: FieldGroupProps) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-white/50">
        {label}
        {required && <span className="ml-0.5 text-white/40">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-white/25">{hint}</p>}
    </div>
  );
}

function GeneratingLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-5 h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-white/[0.08]" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-white/60" />
        <SparkleIcon className="absolute inset-0 m-auto w-5 h-5 text-white/50" />
      </div>
      <p className="text-base font-medium text-white/80">Rédaction de votre annonce en cours…</p>
      <p className="mt-1 text-sm text-white/35">Génération du titre, de la description et des points forts</p>
    </div>
  );
}

interface PreviewProps {
  generated:      GeneratedContent;
  editTitle:      string;
  editDesc:       string;
  onTitleChange:  (v: string) => void;
  onDescChange:   (v: string) => void;
  onSave:         () => void;
  onReset:        () => void;
  isSaving:       boolean;
}

function Preview({
  generated,
  editTitle,
  editDesc,
  onTitleChange,
  onDescChange,
  onSave,
  onReset,
  isSaving,
}: PreviewProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Badge succès */}
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3">
        <p className="text-sm text-white/60">
          Annonce générée avec succès — relisez et corrigez si nécessaire avant d&apos;enregistrer.
        </p>
      </div>

      {/* Titre — éditable */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/50">
          Titre de l&apos;annonce
        </label>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className={`${INPUT_CLS} text-base font-semibold`}
        />
      </div>

      {/* Description — éditable */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-white/50">
          Description
        </label>
        <textarea
          value={editDesc}
          onChange={(e) => onDescChange(e.target.value)}
          rows={9}
          className={`${INPUT_CLS} resize-none leading-relaxed`}
        />
      </div>

      {/* Points forts */}
      <div>
        <p className="mb-3 text-xs font-medium text-white/50">5 points forts générés</p>
        <ul className="space-y-2">
          {generated.points_forts.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/60">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[10px] font-bold text-white/50">
                {i + 1}
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-white/[0.06] pt-5">
        <button
          type="button"
          onClick={onReset}
          disabled={isSaving}
          className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-white/50 transition-colors hover:border-white/20 hover:text-white/80 disabled:opacity-40"
        >
          ← Recommencer
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Enregistrement…
            </>
          ) : (
            "Enregistrer en brouillon"
          )}
        </button>
      </div>
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className ?? "w-4 h-4"}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
      />
    </svg>
  );
}

"use client";

import { useState } from "react";
import type { MarketAnalysis } from "@/app/api/market/analyze/route";
import MarketResults from "@/components/market/MarketResults";

/**
 * components/market/MarketAnalyzerForm.tsx
 *
 * Formulaire de Market Analyzer — Client Component.
 * Flux : form → analyzing → results
 */

/* ── Types ──────────────────────────────────────────────────────────── */

type PropertyType = "apartment" | "house" | "land" | "commercial" | "parking";
type Step         = "form" | "analyzing" | "results";

interface FormValues {
  city:          string;
  district:      string;
  property_type: PropertyType;
  price_min:     string;
  price_max:     string;
}

interface ApiSuccess {
  success: true;
  data:    MarketAnalysis;
}

interface ApiError {
  success: false;
  error:   string;
}

type ApiResponse = ApiSuccess | ApiError;

/* ── Constantes ─────────────────────────────────────────────────────── */

const INPUT_CLS =
  "w-full rounded-lg border border-white/[0.08] bg-[#1a1a2e] px-3.5 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-indigo-500/40 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors";

const PROPERTY_TYPES: Array<{ value: PropertyType; label: string }> = [
  { value: "apartment",  label: "Appartement" },
  { value: "house",      label: "Maison" },
  { value: "land",       label: "Terrain" },
  { value: "commercial", label: "Local commercial" },
  { value: "parking",    label: "Parking" },
];

const PROPERTY_LABELS: Record<PropertyType, string> = {
  apartment:  "Appartement",
  house:      "Maison",
  land:       "Terrain",
  commercial: "Local commercial",
  parking:    "Parking",
};

const INITIAL_FORM: FormValues = {
  city:          "",
  district:      "",
  property_type: "apartment",
  price_min:     "",
  price_max:     "",
};

/* ── Composant ──────────────────────────────────────────────────────── */

export default function MarketAnalyzerForm() {
  const [step, setStep]           = useState<Step>("form");
  const [form, setForm]           = useState<FormValues>(INITIAL_FORM);
  const [analysis, setAnalysis]   = useState<MarketAnalysis | null>(null);
  const [apiError, setApiError]   = useState<string | null>(null);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ── Validation ────────────────────────────────────────────────── */

  function validate(): string | null {
    if (!form.city.trim()) return "La ville est requise.";
    if (form.price_min && form.price_max) {
      const min = parseFloat(form.price_min);
      const max = parseFloat(form.price_max);
      if (!isNaN(min) && !isNaN(max) && min >= max) {
        return "Le prix minimum doit être inférieur au prix maximum.";
      }
    }
    return null;
  }

  /* ── Submit ────────────────────────────────────────────────────── */

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const err = validate();
    if (err) { setApiError(err); return; }
    setApiError(null);
    setStep("analyzing");

    const payload = {
      city:          form.city.trim(),
      district:      form.district.trim() || undefined,
      property_type: form.property_type,
      price_min:     form.price_min ? parseFloat(form.price_min) : undefined,
      price_max:     form.price_max ? parseFloat(form.price_max) : undefined,
    };

    let res: Response;
    try {
      res = await fetch("/api/market/analyze", {
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

    setAnalysis(data.data);
    setStep("results");
  }

  /* ── Render ────────────────────────────────────────────────────── */

  if (step === "analyzing") {
    return <AnalyzingLoader city={form.city} />;
  }

  if (step === "results" && analysis) {
    const locationLabel = form.district.trim()
      ? `${form.city} — ${form.district}`
      : form.city;

    return (
      <MarketResults
        analysis={analysis}
        location={locationLabel}
        typeLabel={PROPERTY_LABELS[form.property_type]}
        onReset={() => { setStep("form"); setAnalysis(null); setApiError(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
          <strong>Erreur :</strong> {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Localisation */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldGroup label="Ville" required>
            <input
              type="text"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Paris, Lyon, Bordeaux…"
              required
              className={INPUT_CLS}
            />
          </FieldGroup>

          <FieldGroup
            label="Arrondissement / Quartier"
            hint="Optionnel — affine l'analyse"
          >
            <input
              type="text"
              value={form.district}
              onChange={(e) => update("district", e.target.value)}
              placeholder="ex : 6e arrondissement, Confluence…"
              className={INPUT_CLS}
            />
          </FieldGroup>
        </div>

        {/* Type de bien */}
        <FieldGroup label="Type de bien">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {PROPERTY_TYPES.map((pt) => (
              <button
                key={pt.value}
                type="button"
                onClick={() => update("property_type", pt.value)}
                className={[
                  "rounded-lg border px-3 py-2.5 text-sm font-medium transition-all",
                  form.property_type === pt.value
                    ? "border-indigo-500/60 bg-indigo-500/10 text-indigo-400"
                    : "border-white/[0.08] bg-white/[0.02] text-white/50 hover:border-white/20 hover:text-white/80",
                ].join(" ")}
              >
                {pt.label}
              </button>
            ))}
          </div>
        </FieldGroup>

        {/* Fourchette de prix */}
        <FieldGroup
          label="Fourchette de prix (optionnel)"
          hint="Permet d'affiner les recommandations de pricing"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="number"
                value={form.price_min}
                onChange={(e) => update("price_min", e.target.value)}
                placeholder="Prix min"
                className={`${INPUT_CLS} pr-8`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/25">€</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={form.price_max}
                onChange={(e) => update("price_max", e.target.value)}
                placeholder="Prix max"
                className={`${INPUT_CLS} pr-8`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/25">€</span>
            </div>
          </div>
        </FieldGroup>

        {/* CTA */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:shadow-indigo-400/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
          >
            <SparkleIcon />
            Analyser
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
  children:  React.ReactNode;
}

function FieldGroup({ label, hint, required, children }: FieldGroupProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/50">
        {label}
        {required && <span className="ml-0.5 text-indigo-400">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-white/25">{hint}</p>}
    </div>
  );
}

function AnalyzingLoader({ city }: { city: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="relative mb-5 h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-400" />
        <SparkleIcon className="absolute inset-0 m-auto h-5 w-5 text-indigo-400" />
      </div>
      <p className="text-base font-medium text-white/80">
        Analyse du marché de <span className="text-indigo-400">{city}</span>…
      </p>
      <p className="mt-1 text-sm text-white/30">
        Score, prix médian, tendance, recommandations…
      </p>
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className ?? "h-4 w-4"} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

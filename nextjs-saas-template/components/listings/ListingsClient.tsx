"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import type { ListingRow } from "@/app/(dashboard)/listings/page";
import { deleteListingAction } from "@/app/actions/listings";

/**
 * components/listings/ListingsClient.tsx
 *
 * Client Component pour la page /listings :
 * - Filtres : recherche, type de bien, statut, source (IA / Manuel), date
 * - Pagination : PAGE_SIZE cards par page
 * - Optimistic UI : suppression immédiate avec rollback si erreur
 */

/* ── Types ──────────────────────────────────────────────────────────── */

type Listing = Pick<
  ListingRow,
  | "id"
  | "agency_id"
  | "title"
  | "description"
  | "property_type"
  | "surface"
  | "rooms"
  | "price"
  | "city"
  | "postal_code"
  | "status"
  | "ai_generated"
  | "created_at"
>;

type PropertyFilter = "all" | "apartment" | "house" | "land" | "commercial" | "parking";
type StatusFilter   = "all" | "draft" | "published" | "archived";
type SourceFilter   = "all" | "ai" | "manual";
type DateFilter     = "all" | "7d" | "30d";

/* ── Constantes ─────────────────────────────────────────────────────── */

const PAGE_SIZE = 12;

const PROPERTY_LABELS: Record<string, string> = {
  apartment:  "Appartement",
  house:      "Maison",
  land:       "Terrain",
  commercial: "Local commercial",
  parking:    "Parking",
};

const STATUS_LABELS: Record<string, string> = {
  draft:     "Brouillon",
  published: "Publié",
  archived:  "Archivé",
};

const STATUS_COLORS: Record<string, string> = {
  draft:     "bg-amber-500/10 text-amber-400",
  published: "bg-emerald-500/10 text-emerald-400",
  archived:  "bg-white/[0.05] text-white/30",
};

const PROPERTY_TYPE_OPTIONS: Array<{ value: PropertyFilter; label: string }> = [
  { value: "all",        label: "Tous les types" },
  { value: "apartment",  label: "Appartement" },
  { value: "house",      label: "Maison" },
  { value: "land",       label: "Terrain" },
  { value: "commercial", label: "Local commercial" },
  { value: "parking",    label: "Parking" },
];

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all",       label: "Tous les statuts" },
  { value: "draft",     label: "Brouillon" },
  { value: "published", label: "Publié" },
  { value: "archived",  label: "Archivé" },
];

const SOURCE_OPTIONS: Array<{ value: SourceFilter; label: string }> = [
  { value: "all",    label: "Toutes les sources" },
  { value: "ai",     label: "Générées par IA" },
  { value: "manual", label: "Saisie manuelle" },
];

const DATE_OPTIONS: Array<{ value: DateFilter; label: string }> = [
  { value: "all", label: "Toutes les dates" },
  { value: "7d",  label: "7 derniers jours" },
  { value: "30d", label: "30 derniers jours" },
];

const SELECT_CLS =
  "rounded-lg border border-white/[0.08] bg-[#0d0d14] px-3 py-2 text-sm text-white/70 focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-colors";

/* ── Helpers ────────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function daysCutoff(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

/* ── Composant principal ─────────────────────────────────────────────── */

interface Props {
  initialListings: Listing[];
}

export default function ListingsClient({ initialListings }: Props) {
  const [listings, setListings]       = useState<Listing[]>(initialListings);
  const [search, setSearch]           = useState("");
  const [typeFilter, setTypeFilter]   = useState<PropertyFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [dateFilter, setDateFilter]   = useState<DateFilter>("all");
  const [page, setPage]               = useState(1);
  const [copiedId, setCopiedId]       = useState<string | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [, startTransition]           = useTransition();

  /* ── Filtrage ──────────────────────────────────────────────────── */

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const cutoff =
      dateFilter === "7d"  ? daysCutoff(7)  :
      dateFilter === "30d" ? daysCutoff(30) : null;

    return listings.filter((l) => {
      if (q && !l.title.toLowerCase().includes(q) && !l.city.toLowerCase().includes(q)) return false;
      if (typeFilter   !== "all" && l.property_type !== typeFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (sourceFilter === "ai"     && !l.ai_generated) return false;
      if (sourceFilter === "manual" &&  l.ai_generated) return false;
      if (cutoff && new Date(l.created_at) < cutoff) return false;
      return true;
    });
  }, [listings, search, typeFilter, statusFilter, sourceFilter, dateFilter]);

  /* ── Pagination ────────────────────────────────────────────────── */

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const paginated   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function goToPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ── Copier ────────────────────────────────────────────────────── */

  function handleCopy(listing: Listing) {
    const text = `${listing.title}\n\n${listing.description ?? ""}`.trim();
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedId(listing.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  /* ── Supprimer (optimistic) ────────────────────────────────────── */

  function handleDelete(id: string) {
    setDeleteError(null);
    const snapshot = listings;
    setDeletingId(id);
    setListings((prev) => prev.filter((l) => l.id !== id));

    startTransition(async () => {
      const result = await deleteListingAction(id);
      if (!result.success) {
        setListings(snapshot);
        setDeleteError(result.error ?? "Erreur lors de la suppression.");
      }
      setDeletingId(null);
    });
  }

  /* ── Reset des filtres ─────────────────────────────────────────── */

  function resetFilters() {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setSourceFilter("all");
    setDateFilter("all");
    setPage(1);
  }

  const hasActiveFilters =
    search || typeFilter !== "all" || statusFilter !== "all" ||
    sourceFilter !== "all" || dateFilter !== "all";

  /* ── Render ────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Annonces</h1>
          <p className="mt-1 text-sm text-white/40">
            {listings.length} annonce{listings.length !== 1 ? "s" : ""} dans votre agence
          </p>
        </div>
        <Link
          href="/listings/new"
          className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400"
        >
          <SparkleIcon />
          Générer une annonce
        </Link>
      </div>

      {/* Erreur suppression */}
      {deleteError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-400">
          <strong>Erreur :</strong> {deleteError}
          <button
            type="button"
            onClick={() => setDeleteError(null)}
            className="ml-3 text-red-400/60 hover:text-red-400"
          >
            ✕
          </button>
        </div>
      )}

      {/* Barre de filtres */}
      <div className="flex flex-wrap gap-3">
        {/* Recherche */}
        <div className="relative min-w-[200px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
          <input
            type="text"
            placeholder="Rechercher par titre ou ville…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-white/[0.08] bg-[#0d0d14] py-2 pl-9 pr-3.5 text-sm text-white placeholder:text-white/25 focus:border-sky-500/40 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-colors"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value as PropertyFilter); setPage(1); }}
          className={SELECT_CLS}
        >
          {PROPERTY_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
          className={SELECT_CLS}
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => { setSourceFilter(e.target.value as SourceFilter); setPage(1); }}
          className={SELECT_CLS}
        >
          {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value as DateFilter); setPage(1); }}
          className={SELECT_CLS}
        >
          {DATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-white/40 transition-colors hover:border-white/20 hover:text-white/70"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Compteur résultats */}
      {hasActiveFilters && (
        <p className="text-xs text-white/30">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""} pour cette recherche
        </p>
      )}

      {/* Grille de cards */}
      {paginated.length === 0 ? (
        <EmptyState hasFilters={!!hasActiveFilters} onReset={resetFilters} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isCopied={copiedId === listing.id}
              isDeleting={deletingId === listing.id}
              onCopy={handleCopy}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
          <p className="text-xs text-white/30">
            Page {safePage} sur {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <PaginationBtn onClick={() => goToPage(1)}      disabled={safePage === 1}          label="«" />
            <PaginationBtn onClick={() => goToPage(safePage - 1)} disabled={safePage === 1}    label="‹" />
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<Array<number | "…">>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-xs text-white/20">…</span>
                ) : (
                  <PaginationBtn
                    key={p}
                    onClick={() => goToPage(p as number)}
                    disabled={false}
                    active={p === safePage}
                    label={String(p)}
                  />
                )
              )}
            <PaginationBtn onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages} label="›" />
            <PaginationBtn onClick={() => goToPage(totalPages)}   disabled={safePage === totalPages} label="»" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Card annonce ───────────────────────────────────────────────────── */

interface CardProps {
  listing:    Listing;
  isCopied:   boolean;
  isDeleting: boolean;
  onCopy:     (l: Listing) => void;
  onDelete:   (id: string) => void;
}

function ListingCard({ listing, isCopied, isDeleting, onCopy, onDelete }: CardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusCls = STATUS_COLORS[listing.status] ?? "bg-white/[0.05] text-white/30";
  const statusLabel = STATUS_LABELS[listing.status] ?? listing.status;
  const typeLabel   = PROPERTY_LABELS[listing.property_type] ?? listing.property_type;

  return (
    <div
      className={[
        "group flex flex-col rounded-xl border bg-[#0d0d14] transition-all",
        isDeleting
          ? "scale-95 opacity-30 border-white/[0.06]"
          : "border-white/[0.06] hover:border-white/[0.12]",
      ].join(" ")}
    >
      {/* En-tête card */}
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-white/40">
              {typeLabel}
            </span>
            <span className={["rounded-md px-2 py-0.5 text-[10px] font-semibold", statusCls].join(" ")}>
              {statusLabel}
            </span>
            {listing.ai_generated && (
              <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                IA
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white/90">
            {listing.title}
          </h3>
        </div>
      </div>

      {/* Aperçu description */}
      {listing.description && (
        <p className="line-clamp-3 px-4 text-xs leading-relaxed text-white/35">
          {listing.description}
        </p>
      )}

      {/* Infos chiffrées */}
      <div className="mt-3 flex items-center gap-4 px-4 text-xs text-white/40">
        <span className="font-semibold text-white/70">{formatPrice(listing.price)}</span>
        <span>{listing.surface} m²</span>
        {listing.rooms ? <span>{listing.rooms} pièces</span> : null}
        <span className="ml-auto">{listing.city}</span>
      </div>

      {/* Pied de card */}
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] px-4 py-2.5">
        <span className="text-[11px] text-white/20">{formatDate(listing.created_at)}</span>

        <div className="flex items-center gap-1">
          {/* Copier */}
          <ActionBtn
            onClick={() => onCopy(listing)}
            title="Copier le texte"
            className={isCopied ? "text-emerald-400" : "text-white/30 hover:text-white/70"}
          >
            {isCopied ? <CheckIcon /> : <CopyIcon />}
          </ActionBtn>

          {/* Rééditer */}
          <Link
            href={`/listings/new`}
            title="Créer une nouvelle annonce"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors text-white/30 hover:bg-white/[0.04] hover:text-white/70"
          >
            <EditIcon />
          </Link>

          {/* Supprimer */}
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setConfirmDelete(false); onDelete(listing.id); }}
                className="rounded-md bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400 transition-colors hover:bg-red-500/30"
              >
                Confirmer
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-md px-2 py-0.5 text-[10px] text-white/30 transition-colors hover:text-white/60"
              >
                Annuler
              </button>
            </div>
          ) : (
            <ActionBtn
              onClick={() => setConfirmDelete(true)}
              title="Supprimer"
              className="text-white/30 hover:text-red-400"
            >
              <TrashIcon />
            </ActionBtn>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────────────────── */

function EmptyState({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#0d0d14] py-20 text-center">
      {hasFilters ? (
        <>
          <p className="text-sm text-white/40">Aucune annonce ne correspond à vos filtres.</p>
          <button
            type="button"
            onClick={onReset}
            className="mt-3 text-sm text-sky-400 underline-offset-2 hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </>
      ) : (
        <>
          <SparkleIcon className="mb-4 h-8 w-8 text-white/10" />
          <p className="text-sm font-medium text-white/40">Aucune annonce pour le moment</p>
          <p className="mt-1 text-xs text-white/20">Générez votre première annonce avec l&apos;IA</p>
          <Link
            href="/listings/new"
            className="mt-5 flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400"
          >
            <SparkleIcon className="h-3.5 w-3.5" />
            Générer une annonce
          </Link>
        </>
      )}
    </div>
  );
}

/* ── Pagination button ──────────────────────────────────────────────── */

function PaginationBtn({
  onClick, disabled, active, label,
}: {
  onClick: () => void;
  disabled: boolean;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex h-7 min-w-[28px] items-center justify-center rounded-md px-1 text-xs transition-colors",
        active
          ? "bg-sky-500/20 font-semibold text-sky-400"
          : "text-white/40 hover:bg-white/[0.04] hover:text-white/70",
        disabled ? "pointer-events-none opacity-20" : "",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

/* ── Action button ──────────────────────────────────────────────────── */

function ActionBtn({
  onClick, title, className, children,
}: {
  onClick: () => void;
  title: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={[
        "inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/[0.04]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ── Icônes SVG ─────────────────────────────────────────────────────── */

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className ?? "h-4 w-4"} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className ?? "h-4 w-4"} aria-hidden>
      <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-3.5 w-3.5" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" /><path strokeLinecap="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-3.5 w-3.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-3.5 w-3.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

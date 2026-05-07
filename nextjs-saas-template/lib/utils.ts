import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * lib/utils.ts — Utilitaires partagés
 *
 * Rôle : fonctions pures réutilisables dans tout le projet.
 * - cn() : fusionne les classes Tailwind intelligemment (résout les conflits).
 * - formatPrice() : formate les prix en euros selon la locale française.
 * - formatSurface() : formate les surfaces en m².
 * - formatDate() : formate les dates en français.
 */

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPricePerSqm(price: number, surface: number): string {
  if (surface <= 0) return "—";
  return formatPrice(Math.round(price / surface)) + "/m²";
}

export function formatSurface(surface: number): string {
  return `${surface.toLocaleString("fr-FR")} m²`;
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine(s)`;
  return formatDate(dateString);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * app/layout.tsx — Layout racine (Root Layout)
 *
 * Rôle : enveloppe TOUTES les pages de l'application.
 * - Définit les balises <html> et <body>.
 * - Charge la police Inter via next/font (optimisé, auto-hébergé).
 * - Exporte les métadonnées SEO globales.
 * - Tout Provider global (auth, theme, toast) va ici.
 */

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ImmoSaaS — Annonces IA pour agences immobilières",
    template: "%s | ImmoSaaS",
  },
  description:
    "Générez des annonces immobilières percutantes grâce à l'IA et analysez le marché local en temps réel.",
  keywords: ["immobilier", "IA", "annonces", "agence", "market analyzer", "SaaS"],
  authors: [{ name: "ImmoSaaS" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://immo-saas.vercel.app"
  ),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    title: "ImmoSaaS — Annonces IA pour agences immobilières",
    description:
      "Générez des annonces immobilières percutantes grâce à l'IA et analysez le marché local.",
    siteName: "ImmoSaaS",
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import ListingGeneratorForm from "@/components/listings/ListingGeneratorForm";

/**
 * app/(dashboard)/listings/new/page.tsx — Générateur d'annonces IA
 *
 * Rôle : formulaire de création d'une annonce avec génération IA.
 * - L'utilisateur saisit les caractéristiques du bien (type, surface, pièces, prix, etc.).
 * - Le Client Component ListingGeneratorForm appelle la Server Action generateListing()
 *   qui interroge OpenAI pour produire le titre et la description optimisés.
 * - Le résultat est éditable avant publication.
 */

export const metadata: Metadata = {
  title: "Nouvelle annonce IA",
};

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Créer une annonce avec l&apos;IA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Renseignez les caractéristiques du bien. L&apos;IA génère titre et description
          optimisés pour les portails immobiliers.
        </p>
      </div>
      <ListingGeneratorForm />
    </div>
  );
}

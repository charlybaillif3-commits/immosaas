import type { Metadata } from "next";
import Link from "next/link";
import GeneratorForm from "@/components/listings/GeneratorForm";

export const metadata: Metadata = {
  title: "Nouvelle annonce IA",
  description: "Générez une annonce immobilière professionnelle.",
};

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">

      <div>
        <div className="flex items-center gap-2 text-xs text-white/30 mb-4">
          <Link href="/listings" className="hover:text-white/60 transition-colors">
            Annonces
          </Link>
          <span>/</span>
          <span className="text-white/50">Nouvelle annonce IA</span>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
              className="w-4 h-4 text-white/60" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              Générer une annonce
            </h1>
            <p className="mt-0.5 text-sm text-white/40">
              Renseignez les caractéristiques du bien — l&apos;IA rédige le titre,
              la description et les points forts en quelques secondes.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#0f0f13] p-6">
        <GeneratorForm />
      </div>

    </div>
  );
}

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import WaitlistForm from "./_components/WaitlistForm";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#080810] text-white antialiased">

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080810]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-bold tracking-tight text-white">Propstack</span>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#fonctionnalites" className="text-sm text-white/60 transition-colors hover:text-white">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="text-sm text-white/60 transition-colors hover:text-white">
              Tarifs
            </a>
            <a href="#beta" className="text-sm text-white/60 transition-colors hover:text-white">
              Beta
            </a>
          </nav>

          <a
            href="#beta"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-white/90"
          >
            Rejoindre la beta →
          </a>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-24 text-center animate-fade-in">
        <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
          Générez des annonces
          <br />
          <span className="text-white/60">qui vendent.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-base text-white/50 md:text-lg">
          La plateforme IA pour agences immobilières françaises.
          <br />
          Analysez votre marché en quelques secondes.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href="#beta"
            className="rounded-xl bg-white px-8 py-4 text-base font-bold text-black transition-all hover:bg-white/90"
          >
            Accès beta gratuit →
          </a>
          <p className="text-xs text-white/30">
            47 agences inscrites · 1 mois offert aux 50 premiers
          </p>
        </div>

        {/* Mockup hero */}
        <div className="relative mt-12 h-96 w-full overflow-hidden rounded-2xl border border-white/[0.06]">
          <Image
            src="/images/dashboard.png"
            alt="Dashboard Propstack"
            fill
            className="object-cover rounded-xl"
          />
        </div>
      </section>

      {/* ── Social proof ────────────────────────────────────────────────── */}
      <section className="border-b border-t border-white/[0.06] bg-[#0f0f13]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-white/[0.06] px-6 py-10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            { stat: "2× plus vite",         label: "Rédaction d'annonces" },
            { stat: "3 styles",              label: "Prestige, Standard, Coup de cœur" },
            { stat: "30 secondes",           label: "Analyse de marché complète" },
          ].map(({ stat, label }) => (
            <div key={stat} className="py-6 text-center md:py-0">
              <p className="text-2xl font-bold text-white">{stat}</p>
              <p className="mt-1 text-sm text-white/40">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="fonctionnalites" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Tout ce dont votre agence a besoin
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon:  "✦",
              title: "Génération d'annonces IA",
              desc:  "Prestige, Standard ou Coup de cœur. Rédigé en 10 secondes.",
              img:   "/images/feature1.png",
            },
            {
              icon:  "↗",
              title: "Analyse de marché instantanée",
              desc:  "Score /10, prix au m², tendance et recommandations.",
              img:   "/images/feature2.png",
            },
            {
              icon:  "◎",
              title: "Signez plus, rédigez moins",
              desc:  "2-3h économisées par mandat. Concentrez-vous sur vos clients.",
              img:   "/images/feature3.png",
            },
          ].map(({ icon, title, desc, img }) => (
            <div
              key={title}
              className="rounded-xl border border-white/[0.06] border-t-2 border-t-white bg-[#0f0f13] p-8"
            >
              <p className="mb-4 text-xl text-white/40">{icon}</p>
              <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{desc}</p>
              <div className="mt-4 overflow-hidden rounded-lg border border-white/[0.06]">
                <Image
                  src={img}
                  alt={title}
                  width={400}
                  height={200}
                  className="w-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="tarifs" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-4 text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Tarifs simples, sans surprise
          </h2>
          <p className="mt-3 text-sm text-white/50">
            Prix beta — augmente au lancement officiel
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 md:gap-8 max-w-3xl mx-auto">
          {/* Starter */}
          <div className="flex flex-col rounded-xl border border-white/[0.06] bg-[#0f0f13] p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Starter</p>
                <p className="mt-1 text-4xl font-bold text-white">49€<span className="text-lg font-normal text-white/40">/mois</span></p>
              </div>
              <span className="rounded-md bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-white/60">
                BETA
              </span>
            </div>
            <ul className="flex-1 space-y-3">
              {["50 annonces IA / mois", "10 analyses marché", "1 utilisateur", "Support email"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                  <span className="text-white/25">–</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#beta"
              className="mt-8 block rounded-lg border border-white/20 px-6 py-3 text-center text-sm font-semibold text-white transition-all hover:border-white/40 hover:bg-white/[0.04]"
            >
              Commencer →
            </a>
          </div>

          {/* Pro */}
          <div className="flex flex-col rounded-xl border border-white bg-[#0f0f13] p-8">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/60">Pro</p>
                <p className="mt-1 text-4xl font-bold text-white">89€<span className="text-lg font-normal text-white/40">/mois</span></p>
              </div>
              <span className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-black">
                POPULAIRE
              </span>
            </div>
            <ul className="flex-1 space-y-3">
              {["Annonces & analyses illimitées", "5 utilisateurs", "Support prioritaire", "Onboarding 1-to-1"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                  <span className="text-white/25">–</span>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="#beta"
              className="mt-8 block rounded-lg bg-white px-6 py-3 text-center text-sm font-semibold text-black transition-all hover:bg-white/90"
            >
              Commencer →
            </a>
          </div>
        </div>
      </section>

      {/* ── Waitlist ─────────────────────────────────────────────────────── */}
      <section id="beta" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/[0.06] bg-[#0f0f13] p-10 md:p-12">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Réservez votre accès beta
            </h2>
            <p className="mt-3 text-sm text-white/50">
              Les 50 premières agences obtiennent 1 mois offert
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] bg-[#080810]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 md:flex-row md:justify-between md:gap-0">
          <span className="text-base font-bold text-white">Propstack</span>
          <p className="text-sm text-white/30">© 2025 Propstack</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-white/30 transition-colors hover:text-white/60">CGU</a>
            <a href="#" className="text-sm text-white/30 transition-colors hover:text-white/60">Confidentialité</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

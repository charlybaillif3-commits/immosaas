import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  const fullName = user?.fullName ?? "";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Paramètres</h1>
        <p className="mt-1 text-sm text-white/40">Gérez votre profil et les préférences de votre agence.</p>
      </div>

      {/* Profil */}
      <section className="rounded-xl border border-white/[0.06] bg-[#0f0f13] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Profil utilisateur</h2>

        <div className="flex items-center gap-4 mb-6">
          {user?.imageUrl ? (
            <img src={user.imageUrl} alt={fullName} className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.08] text-lg font-bold text-white/70 ring-2 ring-white/10">
              {fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-white/80">{fullName || "—"}</p>
            <p className="text-xs text-white/35">{email}</p>
            <p className="mt-1 text-[11px] text-white/30">
              Gérez votre avatar et mot de passe sur Clerk →
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Prénom", value: user?.firstName ?? "", placeholder: "Jean" },
            { label: "Nom",    value: user?.lastName  ?? "", placeholder: "Dupont" },
            { label: "Email",  value: email,                placeholder: "", type: "email" },
          ].map((field) => (
            <div key={field.label} className={field.label === "Email" ? "sm:col-span-2" : ""}>
              <label className="mb-1.5 block text-xs font-medium text-white/35">
                {field.label}
              </label>
              <input
                type={field.type ?? "text"}
                defaultValue={field.value}
                placeholder={field.placeholder}
                readOnly={field.label === "Email"}
                className="input read-only:opacity-40 read-only:cursor-not-allowed"
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button type="button" className="btn-primary">
            Enregistrer
          </button>
        </div>
      </section>

      {/* Préférences agence */}
      <section className="rounded-xl border border-white/[0.06] bg-[#0f0f13] p-6">
        <h2 className="mb-5 text-sm font-semibold text-white/70">Préférences de génération IA</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/35">
              Ton par défaut des annonces
            </label>
            <select className="input">
              <option value="professional">Professionnel</option>
              <option value="friendly">Chaleureux</option>
              <option value="luxury">Luxe / Prestige</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/35">
              Langue des annonces générées
            </label>
            <select className="input">
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button type="button" className="btn-primary">
            Enregistrer
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-white/[0.06] bg-[#0f0f13] p-6">
        <h2 className="mb-2 text-sm font-semibold text-white/40">Zone de danger</h2>
        <p className="mb-4 text-xs text-white/25">
          La suppression de votre compte est irréversible. Toutes vos données seront perdues.
        </p>
        <button
          type="button"
          className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm font-medium text-white/30 transition-colors hover:border-white/20 hover:text-white/50"
        >
          Supprimer mon compte
        </button>
      </section>
    </div>
  );
}

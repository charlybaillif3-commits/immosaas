"use client";

import { useState, FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [agence, setAgence] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            fields: [
              { label: "Votre email professionnel", value: email },
              { label: "Nom de votre agence",        value: agence },
            ],
          },
        }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setAgence("");
      } else {
        const json = (await res.json()) as { error?: string };
        setErrorMsg(json.error ?? "Une erreur est survenue.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Impossible de joindre le serveur.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-8 text-center">
        <p className="mb-1 text-lg font-semibold text-white">Accès réservé.</p>
        <p className="text-sm text-white/50">
          Vous recevrez un email de confirmation sous peu. Bienvenue parmi les premiers.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email professionnel"
        className="w-full rounded-xl border border-white/10 bg-[#080810] px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/10 transition-colors"
      />
      <input
        type="text"
        value={agence}
        onChange={(e) => setAgence(e.target.value)}
        placeholder="Nom de votre agence"
        className="w-full rounded-xl border border-white/10 bg-[#080810] px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/10 transition-colors"
      />

      {status === "error" && (
        <p className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white/60">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition-all hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Envoi en cours…" : "Réserver ma place →"}
      </button>

      <p className="text-center text-xs text-white/30">
        Sans engagement · Pas de carte bancaire requise
      </p>
    </form>
  );
}

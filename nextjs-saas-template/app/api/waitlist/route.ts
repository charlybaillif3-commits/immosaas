import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/* ── Types Tally ────────────────────────────────────────────────────── */

interface TallyField {
  label: string;
  value: string;
}

interface TallyPayload {
  data?: {
    fields?: TallyField[];
  };
}

/* ── Email HTML ─────────────────────────────────────────────────────── */

function buildEmailHtml(nomAgence: string): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #080810; color: #ffffff; padding: 40px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <h1 style="color: #38bdf8;">Orial</h1>
    <h2>Votre demande d'accès beta a bien été enregistrée.</h2>
    <p>Bonjour${nomAgence ? ` — ${nomAgence}` : ""},</p>
    <p>Notre équipe vous contactera dans les prochains jours pour finaliser votre accès et organiser votre session d'onboarding personnalisée.</p>
    <div style="background: #0d0d14; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; margin: 24px 0;">
      <p style="margin: 0; color: #38bdf8; font-weight: bold;">🎁 Ce qui vous attend :</p>
      <ul style="margin-top: 12px;">
        <li>1 mois d'accès offert (valeur 89€)</li>
        <li>Onboarding personnalisé 1-to-1</li>
        <li>Accès prioritaire aux nouvelles features</li>
      </ul>
    </div>
    <p>En attendant, si vous avez des questions : <a href="mailto:contact@immosaas.fr" style="color: #38bdf8;">contact@immosaas.fr</a></p>
    <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 40px;">Orial © 2025 · La plateforme IA pour agences immobilières</p>
  </div>
</body>
</html>`;
}

/* ── Handler ────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: TallyPayload;
  try {
    body = (await req.json()) as TallyPayload;
  } catch {
    return NextResponse.json({ success: false, error: "Payload JSON invalide." }, { status: 400 });
  }

  const fields = body?.data?.fields ?? [];

  const email = fields.find(
    (f) => f.label === "Votre email professionnel"
  )?.value?.trim();

  const nomAgence = fields.find(
    (f) => f.label === "Nom de votre agence"
  )?.value?.trim() ?? "";

  if (!email) {
    console.error("[waitlist] Champ email manquant dans le payload Tally", JSON.stringify(body));
    return NextResponse.json({ success: false, error: "Email introuvable dans le payload." }, { status: 422 });
  }

  console.log(`[waitlist] Nouvelle inscription — email: ${email}, agence: ${nomAgence || "(non renseigné)"}`);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[waitlist] RESEND_API_KEY manquante");
    return NextResponse.json({ success: false, error: "Clé Resend manquante." }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from:    "Orial <onboarding@resend.dev>",
    to:      [email],
    subject: "Votre accès beta Orial est réservé ✓",
    html:    buildEmailHtml(nomAgence),
  });

  if (error) {
    console.error("[waitlist] Erreur Resend:", error);
    return NextResponse.json({ success: false, error: "Échec de l'envoi de l'email." }, { status: 502 });
  }

  console.log(`[waitlist] Email de confirmation envoyé à ${email}`);
  return NextResponse.json({ success: true });
}

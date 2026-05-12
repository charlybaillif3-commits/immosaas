import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

type PlanId = 'starter' | 'pro' | 'scale';

/* ── Plan → Price ID map ─────────────────────────────────────────────── */

const PRICE_IDS: Record<PlanId, string | undefined> = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro:     process.env.STRIPE_PRICE_PRO,
  scale:   process.env.STRIPE_PRICE_SCALE,
};

/* ── POST /api/checkout ──────────────────────────────────────────────── */

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  }

  let plan: PlanId;
  try {
    const body = (await req.json()) as { plan?: string };
    if (!body.plan || !['starter', 'pro', 'scale'].includes(body.plan)) {
      return NextResponse.json({ error: 'Plan invalide.' }, { status: 400 });
    }
    plan = body.plan as PlanId;
  } catch {
    return NextResponse.json({ error: 'Payload JSON invalide.' }, { status: 400 });
  }

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: `Price ID manquant pour le plan "${plan}". Configurez STRIPE_PRICE_${plan.toUpperCase()}.` },
      { status: 500 },
    );
  }

  /* ── Récupère ou crée le customer Stripe ── */

  const supabase = createAdminClient();

  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (subError) {
    return NextResponse.json({ error: 'Erreur base de données.' }, { status: 500 });
  }

  let customerId: string | undefined = sub?.stripe_customer_id ?? undefined;

  if (!customerId) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profil utilisateur introuvable.' }, { status: 404 });
    }

    const customer = await stripe.customers.create({
      email: profile.email ?? undefined,
      name:  profile.full_name ?? undefined,
      metadata: { clerk_user_id: userId },
    });

    customerId = customer.id;
  }

  /* ── Crée la Checkout Session ── */

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode:                'subscription',
      customer:            customerId,
      line_items:          [{ price: priceId, quantity: 1 }],
      success_url:         `${baseUrl}/dashboard?success=true`,
      cancel_url:          `${baseUrl}/billing?canceled=true`,
      subscription_data:   { metadata: { clerk_user_id: userId, plan } },
      metadata:            { clerk_user_id: userId, plan },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur Stripe inconnue.';
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ url: session.url });
}

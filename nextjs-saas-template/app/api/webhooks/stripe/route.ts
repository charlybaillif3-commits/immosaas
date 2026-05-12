import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/* ── POST /api/webhooks/stripe ───────────────────────────────────────── */

export async function POST(req: NextRequest): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET manquant.' }, { status: 500 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Signature Stripe manquante.' }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Signature invalide.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createAdminClient();

  /* ── checkout.session.completed ── */

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const clerkUserId = session.metadata?.clerk_user_id;
    const plan        = session.metadata?.plan ?? 'starter';
    const customerId  = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id ?? null;
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null;

    if (!clerkUserId) {
      return NextResponse.json({ error: 'clerk_user_id manquant dans les métadonnées.' }, { status: 422 });
    }

    const { error: upsertError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id:                  clerkUserId,
        stripe_customer_id:       customerId,
        stripe_subscription_id:   subscriptionId,
        plan,
        status:                   'active',
        updated_at:               new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      return NextResponse.json({ error: `Supabase upsert error: ${upsertError.message}` }, { status: 500 });
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ plan, updated_at: new Date().toISOString() })
      .eq('id', clerkUserId);

    if (profileError) {
      return NextResponse.json({ error: `Profile update error: ${profileError.message}` }, { status: 500 });
    }
  }

  /* ── customer.subscription.updated ── */

  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription;

    const clerkUserId = subscription.metadata?.clerk_user_id;
    const plan        = subscription.metadata?.plan ?? 'starter';
    const status      = subscription.status;

    if (!clerkUserId) {
      return NextResponse.json({ error: 'clerk_user_id manquant dans les métadonnées.' }, { status: 422 });
    }

    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan,
        status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at:         new Date().toISOString(),
      })
      .eq('user_id', clerkUserId);

    if (error) {
      return NextResponse.json({ error: `Supabase update error: ${error.message}` }, { status: 500 });
    }
  }

  /* ── customer.subscription.deleted ── */

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const clerkUserId  = subscription.metadata?.clerk_user_id;

    if (!clerkUserId) {
      return NextResponse.json({ error: 'clerk_user_id manquant dans les métadonnées.' }, { status: 422 });
    }

    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('user_id', clerkUserId);

    if (error) {
      return NextResponse.json({ error: `Supabase update error: ${error.message}` }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

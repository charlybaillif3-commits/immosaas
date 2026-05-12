import { createAdminClient } from './supabase/admin';

/* ── Types ──────────────────────────────────────────────────────────── */

export type PlanId = 'starter' | 'pro' | 'scale';
export type SubscriptionStatus = 'active' | 'canceled' | 'trialing' | 'past_due' | 'none';

export interface Subscription {
  agency_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanId;
  status: SubscriptionStatus;
  current_period_end: string | null;
}

export interface PlanLimits {
  listings: number;
  analyses: number;
  users: number;
}

export interface UsageResult {
  allowed: boolean;
  used: number;
  limit: number;
}

/* ── Plan limits ─────────────────────────────────────────────────────── */

const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  starter: { listings: 30,  analyses: 10, users: 1  },
  pro:     { listings: 150, analyses: 50, users: 5  },
  scale:   { listings: -1,  analyses: -1, users: 15 },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_LIMITS[plan as PlanId] ?? PLAN_LIMITS.starter;
}

/* ── Résolution agency_id ────────────────────────────────────────────── */

async function getAgencyId(userId: string): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data?.agency_id ?? null;
}

/* ── Get subscription ────────────────────────────────────────────────── */

export async function getUserSubscription(userId: string): Promise<Subscription> {
  const supabase = createAdminClient();

  const agencyId = await getAgencyId(userId);

  if (!agencyId) {
    return {
      agency_id:               '',
      stripe_customer_id:      null,
      stripe_subscription_id:  null,
      plan:                    'starter',
      status:                  'none',
      current_period_end:      null,
    };
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('agency_id', agencyId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch subscription: ${error.message}`);
  }

  if (!data) {
    return {
      agency_id:               agencyId,
      stripe_customer_id:      null,
      stripe_subscription_id:  null,
      plan:                    'starter',
      status:                  'none',
      current_period_end:      null,
    };
  }

  return data as Subscription;
}

/* ── Check usage limit ───────────────────────────────────────────────── */

export async function checkUsageLimit(
  userId: string,
  feature: 'listings' | 'analyses',
): Promise<UsageResult> {
  const supabase = createAdminClient();

  const subscription = await getUserSubscription(userId);
  const limits = getPlanLimits(subscription.plan);
  const limit = feature === 'listings' ? limits.listings : limits.analyses;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count, error } = await supabase
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq("user_id", userId)
    .eq('action_type', feature === 'listings' ? 'generate_listing' : 'analyze_market')
    .gte('created_at', startOfMonth);

  if (error) {
    throw new Error(`Failed to check usage: ${error.message}`);
  }

  const used = count ?? 0;

  return {
    allowed: limit === -1 || used < limit,
    used,
    limit,
  };
}

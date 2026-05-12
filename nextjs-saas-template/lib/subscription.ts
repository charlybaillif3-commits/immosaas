import { createAdminClient } from './supabase/admin';

export async function getUserSubscription(userId: string) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', userId)
    .single();

  if (!profile?.agency_id) return null;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('agency_id', profile.agency_id)
    .single();

  return subscription;
}

export function getPlanLimits(plan: string) {
  const limits: Record<string, { listings: number; analyses: number }> = {
    starter: { listings: 30,  analyses: 10 },
    pro:     { listings: 150, analyses: 50 },
    scale:   { listings: -1,  analyses: -1 },
  };
  return limits[plan] ?? limits['starter'];
}

export async function checkUsageLimit(
  userId: string,
  feature: 'listings' | 'analyses',
) {
  const supabase = createAdminClient();

  const subscription = await getUserSubscription(userId);
  const plan = subscription?.plan ?? 'starter';
  const limits = getPlanLimits(plan);
  const limit = feature === 'listings' ? limits.listings : limits.analyses;

  const { data: profile } = await supabase
    .from('profiles')
    .select('agency_id')
    .eq('id', userId)
    .single();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { count } = await supabase
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', profile?.agency_id ?? '')
    .eq('action_type', feature === 'listings' ? 'generate_listing' : 'analyze_market')
    .gte('created_at', startOfMonth);

  const used = count ?? 0;

  return {
    allowed: limit === -1 || used < limit,
    used,
    limit,
    plan,
  };
}

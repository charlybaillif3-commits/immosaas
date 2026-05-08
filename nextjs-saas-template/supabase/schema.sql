-- ============================================================================
-- ImmoSaaS — Schéma Supabase complet
-- Stack : Next.js 14 + Clerk (auth) + Supabase (DB uniquement)
--
-- Instructions :
--   1. Ouvrez votre projet sur https://supabase.com
--   2. Allez dans "SQL Editor" → "New query"
--   3. Collez ce fichier en entier et cliquez "Run"
--
-- Notes importantes :
--   - Aucune référence à auth.users (Clerk gère l'authentification)
--   - Pas de RLS (Row Level Security) — la sécurité est gérée côté
--     serveur via service_role_key dans vos Server Actions / Route Handlers
--   - profiles.id = clerk_user_id (format "user_xxxxxxxxxxxx")
-- ============================================================================

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- pour la recherche full-text sur city/title


-- ============================================================================
-- 1. PROFILES
--    Miroir des utilisateurs Clerk. Créé via webhook Clerk (user.created).
--    id = clerk_user_id (ex: "user_2abc123xyz")
-- ============================================================================
create table if not exists public.profiles (
  id             text        primary key,                    -- Clerk user ID
  email          text        not null unique,
  full_name      text,
  avatar_url     text,
  role           text        not null default 'agent'
                             check (role in ('owner', 'admin', 'agent')),
  agency_id      uuid,                                       -- FK ajoutée après agencies
  is_active      boolean     not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.profiles is
  'Miroir des utilisateurs Clerk. Synchronisé via webhook Clerk.';
comment on column public.profiles.id is
  'Clerk user ID (format : user_xxxx). PAS un UUID Supabase.';


-- ============================================================================
-- 2. AGENCIES
--    Une agence = un tenant B2B. owner_id = Clerk user ID du créateur.
-- ============================================================================
create table if not exists public.agencies (
  id             uuid        primary key default uuid_generate_v4(),
  name           text        not null,
  slug           text        not null unique,
  logo_url       text,
  plan           text        not null default 'starter'
                             check (plan in ('starter', 'pro', 'enterprise')),
  owner_id       text        not null references public.profiles(id)
                             on delete restrict,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.agencies is
  'Entité principale B2B. Chaque agence immobilière est un tenant isolé.';

-- FK profiles → agencies (ajoutée ici pour éviter les dépendances circulaires)
alter table public.profiles
  add constraint profiles_agency_id_fkey
  foreign key (agency_id)
  references public.agencies(id)
  on delete set null;


-- ============================================================================
-- 3. LISTINGS
--    Annonces immobilières. Liées à une agence.
-- ============================================================================
create table if not exists public.listings (
  id             uuid        primary key default uuid_generate_v4(),
  agency_id      uuid        not null references public.agencies(id)
                             on delete cascade,
  title          text        not null,
  description    text,
  highlights     text[]      not null default '{}',
  property_type  text        not null
                             check (property_type in (
                               'apartment', 'house', 'land', 'commercial', 'parking'
                             )),
  surface        numeric(10,2) not null check (surface > 0),
  rooms          smallint    check (rooms > 0),
  bedrooms       smallint    check (bedrooms >= 0),
  price          numeric(15,2) not null check (price > 0),
  price_per_sqm  numeric(10,2) generated always as (
                   case when surface > 0 then round(price / surface, 2) else null end
                 ) stored,
  address        text,
  city           text        not null,
  postal_code    text        not null,
  latitude       numeric(9,6),
  longitude      numeric(9,6),
  status         text        not null default 'draft'
                             check (status in (
                               'draft', 'active', 'sold', 'rented', 'archived'
                             )),
  features       text[]      not null default '{}',
  images         text[]      not null default '{}',
  views_count    integer     not null default 0 check (views_count >= 0),
  ai_generated   boolean     not null default false,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.listings is
  'Annonces immobilières. price_per_sqm est calculé automatiquement (colonne générée).';
comment on column public.listings.price_per_sqm is
  'Calculé automatiquement : price / surface. Lecture seule.';


-- ============================================================================
-- 4. MARKET_ANALYSES
--    Rapports d'analyse de marché générés par l'IA.
-- ============================================================================
create table if not exists public.market_analyses (
  id             uuid        primary key default uuid_generate_v4(),
  agency_id      uuid        not null references public.agencies(id)
                             on delete cascade,
  city           text        not null,
  postal_code    text        not null,
  property_type  text        not null
                             check (property_type in (
                               'apartment', 'house', 'land', 'commercial'
                             )),
  avg_price_sqm  numeric(10,2),
  trend          text        check (trend in ('rising', 'stable', 'declining')),
  trend_percent  numeric(5,2),
  narrative      text,
  recommendations text[]     not null default '{}',
  data           jsonb       not null default '{}',
  created_at     timestamptz not null default now()
);

comment on table public.market_analyses is
  'Rapports IA d''analyse de marché. data contient les points de données bruts (JSONB).';
comment on column public.market_analyses.data is
  'Points de données bruts : [{month, avg_price_sqm, transaction_count}].';


-- ============================================================================
-- 5. SUBSCRIPTIONS
--    Abonnements Stripe. Une ligne par agence (contrainte UNIQUE sur agency_id).
-- ============================================================================
create table if not exists public.subscriptions (
  id                     uuid        primary key default uuid_generate_v4(),
  agency_id              uuid        not null unique
                                     references public.agencies(id)
                                     on delete cascade,
  stripe_customer_id     text        unique,
  stripe_subscription_id text        unique,
  plan                   text        not null default 'starter'
                                     check (plan in ('starter', 'pro', 'enterprise')),
  status                 text        not null default 'trialing'
                                     check (status in (
                                       'trialing', 'active', 'past_due',
                                       'canceled', 'incomplete', 'unpaid'
                                     )),
  current_period_end     timestamptz,
  cancel_at_period_end   boolean     not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.subscriptions is
  'Abonnements Stripe. Une seule ligne par agence (unique sur agency_id).';
comment on column public.subscriptions.stripe_customer_id is
  'ID client Stripe (format : cus_xxxx). Unique — une agence = un customer.';


-- ============================================================================
-- 6. AI_USAGE
--    Journal de consommation IA par agence et par utilisateur.
--    Permet la facturation, les limites de plan et l'audit.
-- ============================================================================
create table if not exists public.ai_usage (
  id           uuid        primary key default uuid_generate_v4(),
  agency_id    uuid        not null references public.agencies(id)
               on delete cascade,
  user_id      text        not null references public.profiles(id)
               on delete cascade,
  action_type  text        not null
               check (action_type in (
                 'generate_listing',
                 'analyze_market',
                 'generate_description',
                 'other'
               )),
  tokens_used  integer     not null default 0 check (tokens_used >= 0),
  model        text,
  metadata     jsonb       not null default '{}',
  created_at   timestamptz not null default now()
);

comment on table public.ai_usage is
  'Journal de consommation IA. Utilisé pour les limites de plan et la facturation.';
comment on column public.ai_usage.metadata is
  'Données contextuelles : {listing_id?, city?, model_params?}.';


-- ============================================================================
-- INDEXES
-- Stratégie : index sur toutes les colonnes utilisées dans WHERE, JOIN, ORDER BY
-- ============================================================================

-- profiles
create index if not exists idx_profiles_agency_id   on public.profiles(agency_id);
create index if not exists idx_profiles_email        on public.profiles(email);
create index if not exists idx_profiles_role         on public.profiles(role);

-- agencies
create index if not exists idx_agencies_owner_id     on public.agencies(owner_id);
create index if not exists idx_agencies_slug         on public.agencies(slug);
create index if not exists idx_agencies_plan         on public.agencies(plan);

-- listings
create index if not exists idx_listings_agency_id    on public.listings(agency_id);
create index if not exists idx_listings_status       on public.listings(status);
create index if not exists idx_listings_city         on public.listings(city);
create index if not exists idx_listings_property_type on public.listings(property_type);
create index if not exists idx_listings_created_at   on public.listings(created_at desc);
create index if not exists idx_listings_published_at on public.listings(published_at desc)
  where published_at is not null;
-- Recherche full-text sur le titre (pg_trgm)
create index if not exists idx_listings_title_trgm   on public.listings
  using gin (title gin_trgm_ops);

-- market_analyses
create index if not exists idx_market_agency_id      on public.market_analyses(agency_id);
create index if not exists idx_market_city           on public.market_analyses(city);
create index if not exists idx_market_property_type  on public.market_analyses(property_type);
create index if not exists idx_market_created_at     on public.market_analyses(created_at desc);

-- subscriptions
create index if not exists idx_subscriptions_agency_id          on public.subscriptions(agency_id);
create index if not exists idx_subscriptions_stripe_customer_id  on public.subscriptions(stripe_customer_id);
create index if not exists idx_subscriptions_status              on public.subscriptions(status);

-- ai_usage
create index if not exists idx_ai_usage_agency_id    on public.ai_usage(agency_id);
create index if not exists idx_ai_usage_user_id      on public.ai_usage(user_id);
create index if not exists idx_ai_usage_action_type  on public.ai_usage(action_type);
create index if not exists idx_ai_usage_created_at   on public.ai_usage(created_at desc);


-- ============================================================================
-- TRIGGERS : updated_at automatique
-- Mise à jour automatique de updated_at sur INSERT/UPDATE
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_agencies_updated_at
  before update on public.agencies
  for each row execute function public.set_updated_at();

create trigger trg_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();


-- ============================================================================
-- DONNÉES DE TEST (optionnel — supprimez ce bloc en production)
-- ============================================================================

-- Profil propriétaire de test
insert into public.profiles (id, email, full_name, role, is_active)
values (
  'user_test_owner_001',
  'owner@immo-saas.fr',
  'Jean Dupont',
  'owner',
  true
)
on conflict (id) do nothing;

-- Agence de test
insert into public.agencies (id, name, slug, plan, owner_id)
values (
  '00000000-0000-0000-0000-000000000001',
  'Agence Test Paris',
  'agence-test-paris',
  'pro',
  'user_test_owner_001'
)
on conflict (slug) do nothing;

-- Mise à jour du profil avec l'agency_id
update public.profiles
set agency_id = '00000000-0000-0000-0000-000000000001'
where id = 'user_test_owner_001';

-- Abonnement de test
insert into public.subscriptions (agency_id, plan, status)
values ('00000000-0000-0000-0000-000000000001', 'pro', 'active')
on conflict (agency_id) do nothing;


-- ============================================================================
-- RÉSUMÉ DES TABLES
-- ============================================================================
-- profiles         : utilisateurs (Clerk user ID comme PK)
-- agencies         : agences immobilières (tenants B2B)
-- listings         : annonces immobilières
-- market_analyses  : rapports d'analyse IA du marché
-- subscriptions    : abonnements Stripe (1 par agence)
-- ai_usage         : journal de consommation IA
-- ============================================================================

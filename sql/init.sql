-- Core multi-tenant + events + usage + RL schema
create extension if not exists pgcrypto;
create extension if not exists uuid-ossp;

create table if not exists tenants(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'starter',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists api_keys(
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  hash text not null,
  scopes text[] not null default '{read:*,write:*}',
  created_at timestamptz not null default now()
);

create table if not exists events(
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  source text not null,
  type text not null,
  body jsonb not null,
  tags text[] not null default '{}',
  occurred_at timestamptz not null default now()
);

create table if not exists usage_events(
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  customer_id text not null,
  job text not null,
  units int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists rl_arms(
  id uuid primary key default gen_random_uuid(),
  segment_key text not null,
  action_key text not null,
  alpha double precision not null default 1,
  beta double precision not null default 1,
  impressions int not null default 0,
  conversions double precision not null default 0,
  last_updated timestamptz not null default now(),
  unique(segment_key, action_key)
);

create table if not exists rl_events(
  id uuid primary key default gen_random_uuid(),
  correlation_id uuid not null,
  segment_key text not null,
  action_key text not null,
  event_type text not null,
  weight double precision not null default 0,
  created_at timestamptz not null default now()
);

-- RLS enablement (example for events; repeat for others)
alter table events enable row level security;
create policy tenant_isolation_events on events
  using (tenant_id::text = current_setting('request.jwt.claims', true)::jsonb->>'tenant_id');


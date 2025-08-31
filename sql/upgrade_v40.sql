-- Upgrade v40: resilience + queues + metrics
create table if not exists idempotency_keys (
  id bigserial primary key,
  tenant_id text not null,
  provider text not null,
  external_id text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, provider, external_id)
);

create table if not exists dead_letters (
  id bigserial primary key,
  fn text not null,
  payload jsonb,
  error text,
  retry_count int not null default 0,
  last_retry_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists queue_leads (
  id bigserial primary key,
  tenant_id text not null,
  source text not null,
  body jsonb not null,
  status text not null default 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id bigserial primary key,
  tenant_id text not null,
  contact jsonb not null,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}',
  status text not null default 'received',
  created_at timestamptz not null default now()
);

create table if not exists circuit_breakers (
  service text primary key,
  state text not null default 'closed',
  failure_count int not null default 0,
  half_open_count int not null default 0,
  cooldown_seconds int not null default 60,
  last_failure_at timestamptz
);

create table if not exists rate_limits (
  id bigserial primary key,
  tenant_id text not null,
  bucket text not null,
  ts timestamptz not null default now()
);

create table if not exists usage_events (
  id bigserial primary key,
  tenant_id text not null,
  kind text not null,
  qty int not null default 1,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table if not exists metrics_daily (
  d date primary key,
  tenants int not null default 0,
  new_leads int not null default 0,
  processed_leads int not null default 0,
  usage_events int not null default 0
);

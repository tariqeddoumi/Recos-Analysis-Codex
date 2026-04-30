-- 001_init_suivi_reco.sql
-- Schéma initial pour Supabase PostgreSQL

create schema if not exists suivi_reco;

create extension if not exists pgcrypto;

-- Référentiels et paramétrage
create table if not exists suivi_reco.parameter_settings (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  code text not null,
  label text not null,
  value jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (domain, code)
);

create table if not exists suivi_reco.source_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  coefficient numeric(8,4) not null default 1.0000,
  is_active boolean not null default true
);

create table if not exists suivi_reco.risk_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  is_active boolean not null default true
);

create table if not exists suivi_reco.severity_levels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  level int not null,
  is_active boolean not null default true
);

create table if not exists suivi_reco.probability_levels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  level int not null,
  is_active boolean not null default true
);

create table if not exists suivi_reco.confidentiality_levels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  rank int not null,
  is_active boolean not null default true
);

create table if not exists suivi_reco.entities (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  is_active boolean not null default true
);

-- RBAC
create table if not exists suivi_reco.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null
);

create table if not exists suivi_reco.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  module text not null,
  action text not null
);

create table if not exists suivi_reco.users (
  id uuid primary key,
  email text not null unique,
  full_name text not null,
  entity_id uuid references suivi_reco.entities(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists suivi_reco.user_roles (
  user_id uuid not null references suivi_reco.users(id) on delete cascade,
  role_id uuid not null references suivi_reco.roles(id) on delete cascade,
  primary key (user_id, role_id)
);

create table if not exists suivi_reco.role_permissions (
  role_id uuid not null references suivi_reco.roles(id) on delete cascade,
  permission_id uuid not null references suivi_reco.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- Métier
create table if not exists suivi_reco.missions (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  title text not null,
  source_type_id uuid not null references suivi_reco.source_types(id),
  entity_id uuid references suivi_reco.entities(id),
  status_id uuid not null,
  confidentiality_level_id uuid not null references suivi_reco.confidentiality_levels(id),
  started_at date,
  ended_at date,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists suivi_reco.recommendations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  mission_id uuid not null references suivi_reco.missions(id),
  source_type_id uuid not null references suivi_reco.source_types(id),
  risk_type_id uuid not null references suivi_reco.risk_types(id),
  severity_level_id uuid not null references suivi_reco.severity_levels(id),
  probability_level_id uuid not null references suivi_reco.probability_levels(id),
  confidentiality_level_id uuid not null references suivi_reco.confidentiality_levels(id),
  status_id uuid not null,
  owner_id uuid,
  due_date_initial date,
  due_date_revised date,
  progress numeric(5,2) not null default 0,
  criticity_score numeric(10,4) not null default 0,
  priority_class text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists suivi_reco.actions (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references suivi_reco.recommendations(id) on delete cascade,
  title text not null,
  status_id uuid not null,
  owner_id uuid,
  start_date date,
  due_date date,
  completion_date date,
  weight numeric(5,2) not null default 1,
  progress numeric(5,2) not null default 0,
  evidence_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists suivi_reco.evidences (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references suivi_reco.recommendations(id) on delete cascade,
  action_id uuid references suivi_reco.actions(id) on delete set null,
  evidence_type_id uuid not null,
  title text not null,
  storage_path text not null,
  version int not null default 1,
  validation_status_id uuid not null,
  uploaded_by uuid,
  uploaded_at timestamptz not null default now(),
  file_hash text,
  is_archived boolean not null default false
);

create table if not exists suivi_reco.deadline_extensions (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid references suivi_reco.recommendations(id),
  action_id uuid references suivi_reco.actions(id),
  current_due_date date not null,
  requested_due_date date not null,
  status_id uuid not null,
  reason text not null,
  requester_id uuid,
  requested_at timestamptz not null default now()
);

create table if not exists suivi_reco.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  module text not null,
  action text not null,
  object_type text not null,
  object_id text not null,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create table if not exists suivi_reco.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type_code text not null,
  payload jsonb not null,
  sent_at timestamptz,
  read_at timestamptz
);

create index if not exists idx_recos_status on suivi_reco.recommendations(status_id);
create index if not exists idx_recos_due_date on suivi_reco.recommendations(due_date_revised, due_date_initial);
create index if not exists idx_actions_status on suivi_reco.actions(status_id);
create index if not exists idx_audit_logs_created_at on suivi_reco.audit_logs(created_at desc);

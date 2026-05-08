-- 003_import_excel_workflow.sql
-- Module import Excel, canevas, commentaires, parties prenantes et historique workflow.

alter table suivi_reco.recommendations add column if not exists title text;
alter table suivi_reco.recommendations add column if not exists observation text;
alter table suivi_reco.recommendations add column if not exists owner_name text;
alter table suivi_reco.recommendations add column if not exists expected_deliverable text;
alter table suivi_reco.actions add column if not exists owner_name text;

create table if not exists suivi_reco.import_batches (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  import_type text not null check (import_type in ('recommendations', 'actions', 'canevas')),
  status text not null default 'PREVIEW',
  detected_columns jsonb not null default '[]'::jsonb,
  mapping jsonb not null default '{}'::jsonb,
  total_rows int not null default 0,
  valid_rows int not null default 0,
  rejected_rows int not null default 0,
  imported_rows int not null default 0,
  uploaded_by uuid,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table if not exists suivi_reco.import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references suivi_reco.import_batches(id) on delete cascade,
  line_number int not null,
  raw_data jsonb not null,
  mapped_data jsonb not null default '{}'::jsonb,
  status text not null default 'PENDING',
  corrected_data jsonb,
  created_at timestamptz not null default now(),
  unique (batch_id, line_number)
);

create table if not exists suivi_reco.import_errors (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references suivi_reco.import_batches(id) on delete cascade,
  row_id uuid references suivi_reco.import_rows(id) on delete cascade,
  line_number int not null,
  field_name text,
  message text not null,
  severity text not null default 'ERROR',
  created_at timestamptz not null default now()
);

create table if not exists suivi_reco.excel_column_mappings (
  id uuid primary key default gen_random_uuid(),
  import_type text not null,
  source_column text not null,
  target_field text not null,
  is_required boolean not null default false,
  transformation_rule jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (import_type, source_column, target_field)
);

create table if not exists suivi_reco.recommendation_templates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists suivi_reco.template_fields (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references suivi_reco.recommendation_templates(id) on delete cascade,
  field_key text not null,
  label text not null,
  field_type text not null default 'text',
  is_required boolean not null default false,
  display_order int not null default 0,
  validation_rule jsonb not null default '{}'::jsonb,
  unique (template_id, field_key)
);

create table if not exists suivi_reco.stakeholder_inputs (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid references suivi_reco.recommendations(id) on delete cascade,
  stakeholder_name text not null,
  stakeholder_email text,
  input_payload jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now()
);

create table if not exists suivi_reco.recommendation_comments (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references suivi_reco.recommendations(id) on delete cascade,
  author_id uuid,
  author_name text,
  comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists suivi_reco.recommendation_status_history (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references suivi_reco.recommendations(id) on delete cascade,
  previous_status_code text,
  status_code text not null,
  changed_by uuid,
  comment text,
  changed_at timestamptz not null default now()
);

insert into suivi_reco.parameter_settings (domain, code, label, value) values
  ('WORKFLOW_STATUS', 'BROUILLON', 'Brouillon', '{}'),
  ('WORKFLOW_STATUS', 'OUVERTE', 'Ouverte', '{}'),
  ('WORKFLOW_STATUS', 'EN_COURS', 'En cours', '{}'),
  ('WORKFLOW_STATUS', 'EN_ATTENTE_JUSTIFICATIF', 'En attente justificatif', '{}'),
  ('WORKFLOW_STATUS', 'REALISEE', 'Réalisée', '{}'),
  ('WORKFLOW_STATUS', 'VALIDEE', 'Validée', '{}'),
  ('WORKFLOW_STATUS', 'CLOTUREE', 'Clôturée', '{}'),
  ('WORKFLOW_STATUS', 'REJETEE', 'Rejetée', '{}'),
  ('WORKFLOW_STATUS', 'EN_RETARD', 'En retard', '{}'),
  ('WORKFLOW_STATUS', 'DEMANDE_PROROGATION', 'Demande de prorogation', '{}')
on conflict (domain, code) do nothing;

create index if not exists idx_import_batches_created_at on suivi_reco.import_batches(created_at desc);
create index if not exists idx_import_rows_batch_status on suivi_reco.import_rows(batch_id, status);
create index if not exists idx_reco_status_history_reco on suivi_reco.recommendation_status_history(recommendation_id, changed_at desc);

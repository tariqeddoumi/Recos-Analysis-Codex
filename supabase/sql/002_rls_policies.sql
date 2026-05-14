-- 002_rls_policies.sql
-- Activer RLS et politiques de base (à adapter selon RBAC fin)

alter table suivi_reco.missions enable row level security;
alter table suivi_reco.recommendations enable row level security;
alter table suivi_reco.actions enable row level security;
alter table suivi_reco.evidences enable row level security;
alter table suivi_reco.audit_logs enable row level security;

-- Exemple : utilisateurs authentifiés peuvent lire les référentiels
alter table suivi_reco.source_types enable row level security;
drop policy if exists source_types_read_authenticated on suivi_reco.source_types;
create policy source_types_read_authenticated on suivi_reco.source_types
for select to authenticated using (true);

-- Exemple : écriture limitée au service role via backend
drop policy if exists missions_service_role_all on suivi_reco.missions;
create policy missions_service_role_all on suivi_reco.missions
for all to service_role using (true) with check (true);

drop policy if exists recommendations_service_role_all on suivi_reco.recommendations;
create policy recommendations_service_role_all on suivi_reco.recommendations
for all to service_role using (true) with check (true);

drop policy if exists actions_service_role_all on suivi_reco.actions;
create policy actions_service_role_all on suivi_reco.actions
for all to service_role using (true) with check (true);

drop policy if exists evidences_service_role_all on suivi_reco.evidences;
create policy evidences_service_role_all on suivi_reco.evidences
for all to service_role using (true) with check (true);

drop policy if exists audit_logs_service_role_all on suivi_reco.audit_logs;
create policy audit_logs_service_role_all on suivi_reco.audit_logs
for all to service_role using (true) with check (true);

alter table if exists suivi_reco.import_batches enable row level security;
alter table if exists suivi_reco.import_rows enable row level security;
alter table if exists suivi_reco.import_errors enable row level security;
alter table if exists suivi_reco.excel_column_mappings enable row level security;
alter table if exists suivi_reco.recommendation_templates enable row level security;
alter table if exists suivi_reco.template_fields enable row level security;
alter table if exists suivi_reco.stakeholder_inputs enable row level security;
alter table if exists suivi_reco.recommendation_comments enable row level security;
alter table if exists suivi_reco.recommendation_status_history enable row level security;

drop policy if exists import_batches_service_role_all on suivi_reco.import_batches;
create policy import_batches_service_role_all on suivi_reco.import_batches for all to service_role using (true) with check (true);
drop policy if exists import_rows_service_role_all on suivi_reco.import_rows;
create policy import_rows_service_role_all on suivi_reco.import_rows for all to service_role using (true) with check (true);
drop policy if exists import_errors_service_role_all on suivi_reco.import_errors;
create policy import_errors_service_role_all on suivi_reco.import_errors for all to service_role using (true) with check (true);
drop policy if exists excel_column_mappings_service_role_all on suivi_reco.excel_column_mappings;
create policy excel_column_mappings_service_role_all on suivi_reco.excel_column_mappings for all to service_role using (true) with check (true);
drop policy if exists recommendation_templates_service_role_all on suivi_reco.recommendation_templates;
create policy recommendation_templates_service_role_all on suivi_reco.recommendation_templates for all to service_role using (true) with check (true);
drop policy if exists template_fields_service_role_all on suivi_reco.template_fields;
create policy template_fields_service_role_all on suivi_reco.template_fields for all to service_role using (true) with check (true);
drop policy if exists stakeholder_inputs_service_role_all on suivi_reco.stakeholder_inputs;
create policy stakeholder_inputs_service_role_all on suivi_reco.stakeholder_inputs for all to service_role using (true) with check (true);
drop policy if exists recommendation_comments_service_role_all on suivi_reco.recommendation_comments;
create policy recommendation_comments_service_role_all on suivi_reco.recommendation_comments for all to service_role using (true) with check (true);
drop policy if exists recommendation_status_history_service_role_all on suivi_reco.recommendation_status_history;
create policy recommendation_status_history_service_role_all on suivi_reco.recommendation_status_history for all to service_role using (true) with check (true);

-- V3 banking-grade RBAC/RLS helpers: authenticated users only see their entity scope
-- unless they hold ADMIN:* through role_permissions. Backend writes still go through service_role only.
create or replace function suivi_reco.current_user_has_permission(permission_code text)
returns boolean
language sql
security definer
set search_path = suivi_reco, public
as $$
  select exists (
    select 1
    from suivi_reco.users u
    join suivi_reco.user_roles ur on ur.user_id = u.id
    join suivi_reco.role_permissions rp on rp.role_id = ur.role_id
    join suivi_reco.permissions p on p.id = rp.permission_id
    where u.id = auth.uid() and u.is_active = true and (p.code = permission_code or p.code = 'ADMIN:*')
  );
$$;

create or replace function suivi_reco.current_user_entity_id()
returns uuid
language sql
stable
security definer
set search_path = suivi_reco, public
as $$
  select entity_id from suivi_reco.users where id = auth.uid() and is_active = true
$$;

drop policy if exists missions_entity_read on suivi_reco.missions;
create policy missions_entity_read on suivi_reco.missions
for select to authenticated using (
  suivi_reco.current_user_has_permission('MISSIONS:READ')
  and (suivi_reco.current_user_has_permission('ADMIN:*') or entity_id is null or entity_id = suivi_reco.current_user_entity_id())
);

drop policy if exists recommendations_entity_read on suivi_reco.recommendations;
create policy recommendations_entity_read on suivi_reco.recommendations
for select to authenticated using (
  suivi_reco.current_user_has_permission('RECOMMENDATIONS:READ')
  and (
    suivi_reco.current_user_has_permission('ADMIN:*')
    or exists (select 1 from suivi_reco.missions m where m.id = mission_id and (m.entity_id is null or m.entity_id = suivi_reco.current_user_entity_id()))
  )
);

drop policy if exists actions_entity_read on suivi_reco.actions;
create policy actions_entity_read on suivi_reco.actions
for select to authenticated using (
  suivi_reco.current_user_has_permission('ACTIONS:READ')
  and (
    suivi_reco.current_user_has_permission('ADMIN:*')
    or exists (
      select 1 from suivi_reco.recommendations r
      join suivi_reco.missions m on m.id = r.mission_id
      where r.id = recommendation_id and (m.entity_id is null or m.entity_id = suivi_reco.current_user_entity_id())
    )
  )
);

drop policy if exists evidences_entity_read on suivi_reco.evidences;
create policy evidences_entity_read on suivi_reco.evidences
for select to authenticated using (
  suivi_reco.current_user_has_permission('EVIDENCES:READ')
  and (
    suivi_reco.current_user_has_permission('ADMIN:*')
    or exists (
      select 1 from suivi_reco.recommendations r
      join suivi_reco.missions m on m.id = r.mission_id
      where r.id = recommendation_id and (m.entity_id is null or m.entity_id = suivi_reco.current_user_entity_id())
    )
  )
);

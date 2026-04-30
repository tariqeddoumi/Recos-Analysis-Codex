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

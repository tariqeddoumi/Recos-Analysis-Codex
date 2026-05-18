import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma/client';
import type { CrudField, CrudRecord } from '@/components/crud-workspace';

export type WorkspaceResource = 'missions' | 'recommendations' | 'actions' | 'evidences' | 'audit-log' | 'admin';

export type WorkspaceConfig = {
  resource: WorkspaceResource;
  title: string;
  description: string;
  fields: CrudField[];
  columns: string[];
  statusField?: string;
  readonly?: boolean;
  enabledViews?: Array<'create' | 'read' | 'update' | 'delete' | 'export' | 'audit'>;
};

export const workspaceConfigs: Record<WorkspaceResource, WorkspaceConfig> = {
  missions: {
    resource: 'missions',
    title: 'Registre des missions',
    description: 'Missions lues et persistées dans PostgreSQL via Prisma, avec recherche, tri, pagination et export CSV serveur.',
    fields: [
      { key: 'reference', label: 'Référence', required: true, placeholder: 'M-IG-2026-04' },
      { key: 'title', label: 'Titre', required: true },
      { key: 'source', label: 'Source', required: true },
      { key: 'entity', label: 'Entité', required: true },
      { key: 'status', label: 'Statut', required: true },
      { key: 'startedAt', label: 'Début', type: 'date' },
      { key: 'endedAt', label: 'Fin', type: 'date' },
    ],
    columns: ['reference', 'title', 'source', 'entity', 'status', 'recommendations'],
    statusField: 'status',
  },
  recommendations: {
    resource: 'recommendations',
    title: 'Registre des recommandations',
    description: 'Recommandations branchées à la base avec détail workflow, commentaires, actions, preuves et export comité.',
    fields: [
      { key: 'code', label: 'Code', required: true, placeholder: 'REC-2026-001' },
      { key: 'mission', label: 'Mission', required: true },
      { key: 'title', label: 'Recommandation', required: true },
      { key: 'entity', label: 'Entité', required: true },
      { key: 'status', label: 'Statut', required: true },
      { key: 'severity', label: 'Criticité', required: true },
      { key: 'priority', label: 'Priorité', required: true },
      { key: 'dueDate', label: 'Échéance', type: 'date', required: true },
      { key: 'owner', label: 'Responsable', required: true },
      { key: 'expectedDeliverable', label: 'Livrable attendu', type: 'textarea' },
    ],
    columns: ['code', 'mission', 'title', 'entity', 'status', 'severity', 'dueDate', 'owner'],
    statusField: 'status',
  },
  actions: {
    resource: 'actions',
    title: 'Plans d’action',
    description: 'Actions opérationnelles persistées, avancement recalculable, alerte retard et preuves obligatoires.',
    fields: [
      { key: 'recommendation', label: 'Reco', required: true },
      { key: 'title', label: 'Action', required: true },
      { key: 'owner', label: 'Responsable', required: true },
      { key: 'status', label: 'Statut', required: true },
      { key: 'progress', label: 'Avancement %', type: 'number', required: true },
      { key: 'dueDate', label: 'Échéance', type: 'date', required: true },
      { key: 'evidenceRequired', label: 'Preuve requise', type: 'select', options: ['Oui', 'Non'] },
    ],
    columns: ['recommendation', 'title', 'owner', 'status', 'progress', 'dueDate', 'evidenceRequired'],
    statusField: 'status',
  },
  evidences: {
    resource: 'evidences',
    title: 'Catalogue des preuves',
    description: 'Preuves stockées, versionnées, hashées et validables/rejetables côté serveur.',
    fields: [
      { key: 'recommendation', label: 'Reco', required: true },
      { key: 'title', label: 'Document', required: true },
      { key: 'storagePath', label: 'Stockage', required: true },
      { key: 'validationStatus', label: 'Validation', required: true },
      { key: 'version', label: 'Version', type: 'number', required: true },
      { key: 'uploadedBy', label: 'Déposé par', required: true },
      { key: 'fileHash', label: 'Hash fichier' },
    ],
    columns: ['recommendation', 'title', 'storagePath', 'validationStatus', 'version', 'uploadedBy', 'fileHash'],
    statusField: 'validationStatus',
  },
  'audit-log': {
    resource: 'audit-log',
    title: 'Consultation et export de l’audit',
    description: 'Journal bancaire immuable en lecture seule pour imports, validations, RBAC et opérations sensibles.',
    fields: [
      { key: 'createdAt', label: 'Date' },
      { key: 'module', label: 'Module' },
      { key: 'action', label: 'Action' },
      { key: 'objectType', label: 'Objet' },
      { key: 'status', label: 'Statut' },
      { key: 'actor', label: 'Acteur' },
    ],
    columns: ['createdAt', 'module', 'action', 'objectType', 'status', 'actor'],
    statusField: 'status',
    readonly: true,
    enabledViews: ['read', 'export', 'audit'],
  },
  admin: {
    resource: 'admin',
    title: 'Administration RBAC et référentiels',
    description: 'Rôles, permissions, référentiels, mappings Excel, canevas et paramètres lus depuis les tables de paramétrage.',
    fields: [
      { key: 'role', label: 'Rôle', required: true },
      { key: 'permissions', label: 'Permissions', type: 'textarea', required: true },
      { key: 'module', label: 'Module', required: true },
      { key: 'status', label: 'Statut', required: true },
    ],
    columns: ['role', 'permissions', 'module', 'status'],
    statusField: 'status',
    enabledViews: ['create', 'read', 'update', 'delete', 'export', 'audit'],
  },
};

const listSql: Record<WorkspaceResource, string> = {
  missions: `select m.id::text, m.reference, m.title, coalesce(st.label, st.code, '') as source, coalesce(e.label, '') as entity, coalesce(ps.label, ps.code, '') as status, count(r.id)::text as recommendations, coalesce(to_char(m.started_at, 'YYYY-MM-DD'), '') as "startedAt", coalesce(to_char(m.ended_at, 'YYYY-MM-DD'), '') as "endedAt" from suivi_reco.missions m left join suivi_reco.source_types st on st.id = m.source_type_id left join suivi_reco.entities e on e.id = m.entity_id left join suivi_reco.parameter_settings ps on ps.id = m.status_id left join suivi_reco.recommendations r on r.mission_id = m.id group by m.id, st.label, st.code, e.label, ps.label, ps.code`,
  recommendations: `select r.id::text, r.code, coalesce(m.reference, '') as mission, coalesce(r.title, r.observation, '') as title, coalesce(e.label, '') as entity, coalesce(ps.label, ps.code, '') as status, coalesce(sl.label, sl.code, '') as severity, coalesce(r.priority_class, '') as priority, coalesce(to_char(coalesce(r.due_date_revised, r.due_date_initial), 'YYYY-MM-DD'), '') as "dueDate", coalesce(r.owner_name, '') as owner, coalesce(r.expected_deliverable, '') as "expectedDeliverable", r.progress::text as progress from suivi_reco.recommendations r join suivi_reco.missions m on m.id = r.mission_id left join suivi_reco.entities e on e.id = m.entity_id left join suivi_reco.parameter_settings ps on ps.id = r.status_id left join suivi_reco.severity_levels sl on sl.id = r.severity_level_id`,
  actions: `select a.id::text, r.code as recommendation, a.title, coalesce(a.owner_name, '') as owner, coalesce(ps.label, ps.code, '') as status, round(a.progress, 0)::text as progress, coalesce(to_char(a.due_date, 'YYYY-MM-DD'), '') as "dueDate", case when a.evidence_required then 'Oui' else 'Non' end as "evidenceRequired" from suivi_reco.actions a join suivi_reco.recommendations r on r.id = a.recommendation_id left join suivi_reco.parameter_settings ps on ps.id = a.status_id`,
  evidences: `select ev.id::text, r.code as recommendation, ev.title, ev.storage_path as "storagePath", coalesce(ps.label, ps.code, '') as "validationStatus", ev.version::text, coalesce(u.full_name, ev.uploaded_by::text, '') as "uploadedBy", coalesce(ev.file_hash, '') as "fileHash" from suivi_reco.evidences ev join suivi_reco.recommendations r on r.id = ev.recommendation_id left join suivi_reco.parameter_settings ps on ps.id = ev.validation_status_id left join suivi_reco.users u on u.id::text = ev.uploaded_by::text`,
  'audit-log': `select al.id::text, to_char(al.created_at, 'DD/MM/YYYY HH24:MI') as "createdAt", al.module, al.action, al.object_type as "objectType", 'Traçé' as status, coalesce(u.email, '') as actor from suivi_reco.audit_logs al left join suivi_reco.users u on u.id = al.user_id`,
  admin: `select ro.id::text, ro.label as role, coalesce(string_agg(distinct pe.code, ', ' order by pe.code), 'Aucune permission') as permissions, coalesce(string_agg(distinct pe.module, ', ' order by pe.module), 'RBAC') as module, 'Actif' as status from suivi_reco.roles ro left join suivi_reco.role_permissions rp on rp.role_id = ro.id left join suivi_reco.permissions pe on pe.id = rp.permission_id group by ro.id, ro.label`,
};

export type ListOptions = { search?: string; sort?: string; page?: number; pageSize?: number };

export async function listWorkspaceRows(resource: WorkspaceResource, options: ListOptions = {}) {
  const config = workspaceConfigs[resource];
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(5, options.pageSize ?? 25));
  const sort = config.columns.includes(options.sort ?? '') ? options.sort : config.columns[0];
  const query = options.search?.trim();
  const select = listSql[resource];
  const searchable = ['id', ...config.columns].map((column) => `coalesce(q."${column}"::text, '')`).join(` || ' ' || `);
  const where = query ? `where (${searchable}) ilike $1` : '';
  const params: unknown[] = query ? [`%${query}%`, pageSize, (page - 1) * pageSize] : [pageSize, (page - 1) * pageSize];
  const limitIndex = query ? 2 : 1;
  const offsetIndex = query ? 3 : 2;
  const rows = await prisma.$queryRawUnsafe<CrudRecord[]>(
    `select * from (${select}) q ${where} order by q."${sort}" asc nulls last limit $${limitIndex} offset $${offsetIndex}`,
    ...params,
  );
  const countParams = query ? [`%${query}%`] : [];
  const countRows = await prisma.$queryRawUnsafe<{ count: number }[]>(`select count(*)::int as count from (${select}) q ${where}`, ...countParams);
  return { rows: rows.map(stringifyRecord), total: countRows[0]?.count ?? 0, page, pageSize, sort, search: query ?? '' };
}

export async function exportWorkspaceCsv(resource: WorkspaceResource, options: ListOptions = {}) {
  const { rows } = await listWorkspaceRows(resource, { ...options, page: 1, pageSize: 10000 });
  const columns = workspaceConfigs[resource].columns;
  return [columns.join(';'), ...rows.map((row) => columns.map((column) => csv(row[column] ?? '')).join(';'))].join('\n');
}

const workspaceRecordSchema = z.record(z.string(), z.string().optional());

export async function createWorkspaceRow(resource: WorkspaceResource, data: unknown) {
  const parsed = workspaceRecordSchema.parse(data);
  switch (resource) {
    case 'missions':
      await prisma.$executeRaw`insert into suivi_reco.entities (code, label) values (${slug(parsed.entity)}, ${parsed.entity ?? ''}) on conflict (code) do nothing`;
      await prisma.$executeRaw`
        insert into suivi_reco.missions (reference, title, source_type_id, entity_id, status_id, confidentiality_level_id, started_at, ended_at)
        values (${parsed.reference}, ${parsed.title}, ${refSource(parsed.source)}, (select id from suivi_reco.entities where code = ${slug(parsed.entity)} limit 1), ${refStatus(parsed.status)}, ${refConfidentiality()}, nullif(${parsed.startedAt ?? ''}, '')::date, nullif(${parsed.endedAt ?? ''}, '')::date)`;
      break;
    case 'recommendations':
      await prisma.$executeRaw`
        insert into suivi_reco.recommendations (code, mission_id, source_type_id, risk_type_id, severity_level_id, probability_level_id, confidentiality_level_id, status_id, title, observation, owner_name, expected_deliverable, due_date_initial, priority_class)
        values (${parsed.code}, ${refMission(parsed.mission)}, ${refSource('')}, ${refRisk()}, ${refSeverity(parsed.severity)}, ${refProbability()}, ${refConfidentiality()}, ${refStatus(parsed.status)}, ${parsed.title}, ${parsed.title}, ${parsed.owner}, ${parsed.expectedDeliverable ?? ''}, nullif(${parsed.dueDate ?? ''}, '')::date, ${parsed.priority ?? ''})`;
      break;
    case 'actions':
      await prisma.$executeRaw`
        insert into suivi_reco.actions (recommendation_id, title, status_id, owner_name, due_date, progress, evidence_required)
        values (${refRecommendation(parsed.recommendation)}, ${parsed.title}, ${refStatus(parsed.status)}, ${parsed.owner}, nullif(${parsed.dueDate ?? ''}, '')::date, coalesce(nullif(${parsed.progress ?? '0'}, '')::numeric, 0), ${parsed.evidenceRequired !== 'Non'})`;
      break;
    case 'evidences':
      await prisma.$executeRaw`
        insert into suivi_reco.evidences (recommendation_id, evidence_type_id, title, storage_path, version, validation_status_id, uploaded_by, file_hash)
        values (${refRecommendation(parsed.recommendation)}, ${refEvidenceType()}, ${parsed.title}, ${parsed.storagePath}, coalesce(nullif(${parsed.version ?? '1'}, '')::int, 1), ${refStatus(parsed.validationStatus)}, ${parsed.uploadedBy ?? '00000000-0000-0000-0000-000000000000'}, ${parsed.fileHash ?? ''})`;
      break;
    case 'admin':
      await prisma.$executeRaw`insert into suivi_reco.roles (code, label) values (${slug(parsed.role)}, ${parsed.role}) on conflict (code) do update set label = excluded.label`;
      break;
    case 'audit-log':
      throw new Error('Audit log en lecture seule.');
  }
  await audit(resource, 'CREATE', parsed);
}

export async function updateWorkspaceRow(resource: WorkspaceResource, id: string, data: unknown) {
  const parsed = workspaceRecordSchema.parse(data);
  switch (resource) {
    case 'missions':
      await prisma.$executeRaw`update suivi_reco.missions set title = ${parsed.title}, started_at = nullif(${parsed.startedAt ?? ''}, '')::date, ended_at = nullif(${parsed.endedAt ?? ''}, '')::date, updated_at = now() where id = ${id}::uuid`;
      break;
    case 'recommendations':
      await prisma.$executeRaw`update suivi_reco.recommendations set title = ${parsed.title}, owner_name = ${parsed.owner}, expected_deliverable = ${parsed.expectedDeliverable ?? ''}, due_date_revised = nullif(${parsed.dueDate ?? ''}, '')::date, progress = coalesce(nullif(${parsed.progress ?? '0'}, '')::numeric, progress), updated_at = now() where id = ${id}::uuid`;
      break;
    case 'actions':
      await prisma.$executeRaw`update suivi_reco.actions set title = ${parsed.title}, owner_name = ${parsed.owner}, due_date = nullif(${parsed.dueDate ?? ''}, '')::date, progress = coalesce(nullif(${parsed.progress ?? '0'}, '')::numeric, progress), evidence_required = ${parsed.evidenceRequired !== 'Non'}, updated_at = now() where id = ${id}::uuid`;
      break;
    case 'evidences':
      await prisma.$executeRaw`update suivi_reco.evidences set title = ${parsed.title}, storage_path = ${parsed.storagePath}, file_hash = ${parsed.fileHash ?? ''}, validation_status_id = ${refStatus(parsed.validationStatus)} where id = ${id}::uuid`;
      break;
    case 'admin':
      await prisma.$executeRaw`update suivi_reco.roles set label = ${parsed.role} where id = ${id}::uuid`;
      break;
    case 'audit-log':
      throw new Error('Audit log en lecture seule.');
  }
  await audit(resource, 'UPDATE', { id, ...parsed });
}

export async function deleteWorkspaceRow(resource: WorkspaceResource, id: string) {
  if (resource === 'audit-log') throw new Error('Audit log en lecture seule.');
  const table: Record<Exclude<WorkspaceResource, 'audit-log'>, string> = {
    missions: 'missions', recommendations: 'recommendations', actions: 'actions', evidences: 'evidences', admin: 'roles',
  };
  await prisma.$executeRawUnsafe(`delete from suivi_reco.${table[resource]} where id = $1::uuid`, id);
  await audit(resource, 'DELETE', { id });
}

function stringifyRecord(row: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value == null ? '' : String(value)])) as CrudRecord;
}

function csv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function slug(value?: string, fallback = 'REF') {
  return (value ?? fallback).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 48) || fallback;
}

function refStatus(label?: string) {
  return Prisma.sql`coalesce((select id from suivi_reco.parameter_settings where domain in ('WORKFLOW_STATUS','RECOMMENDATION_STATUS','MISSION_STATUS','ACTION_STATUS') and (lower(label) = lower(${label ?? ''}) or lower(code) = lower(${label ?? ''})) limit 1), (select id from suivi_reco.parameter_settings where domain in ('WORKFLOW_STATUS','RECOMMENDATION_STATUS','MISSION_STATUS','ACTION_STATUS') order by created_at asc limit 1))`;
}
function refSource(label?: string) { return Prisma.sql`coalesce((select id from suivi_reco.source_types where lower(label) = lower(${label ?? ''}) or lower(code) = lower(${label ?? ''}) limit 1), (select id from suivi_reco.source_types order by coefficient desc limit 1))`; }
function refMission(reference?: string) { return Prisma.sql`(select id from suivi_reco.missions where lower(reference) = lower(${reference ?? ''}) limit 1)`; }
function refRecommendation(code?: string) { return Prisma.sql`(select id from suivi_reco.recommendations where lower(code) = lower(${code ?? ''}) limit 1)`; }
function refSeverity(label?: string) { return Prisma.sql`coalesce((select id from suivi_reco.severity_levels where lower(label) = lower(${label ?? ''}) or lower(code) = lower(${label ?? ''}) limit 1), (select id from suivi_reco.severity_levels order by level desc limit 1))`; }
function refRisk() { return Prisma.sql`(select id from suivi_reco.risk_types order by code asc limit 1)`; }
function refProbability() { return Prisma.sql`(select id from suivi_reco.probability_levels order by level desc limit 1)`; }
function refConfidentiality() { return Prisma.sql`(select id from suivi_reco.confidentiality_levels order by rank asc limit 1)`; }
function refEvidenceType() { return Prisma.sql`(select id from suivi_reco.parameter_settings where domain = 'EVIDENCE_TYPE' order by created_at asc limit 1)`; }
async function audit(module: string, action: string, payload: unknown) {
  await prisma.$executeRaw`insert into suivi_reco.audit_logs (module, action, object_type, object_id, new_value) values (${module.toUpperCase()}, ${action}, ${module}, ${crypto.randomUUID()}, ${JSON.stringify(payload)}::jsonb)`;
}

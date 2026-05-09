import { CrudWorkspace, type CrudField, type CrudRecord } from '@/components/crud-workspace';

const fields: CrudField[] = [
  { key: 'createdAt', label: 'Date', required: true },
  { key: 'module', label: 'Module', required: true },
  { key: 'action', label: 'Action', required: true },
  { key: 'objectType', label: 'Objet', required: true },
  { key: 'status', label: 'Statut', required: true },
  { key: 'actor', label: 'Acteur' },
];

const rows: CrudRecord[] = [
  { id: 'audit-1', createdAt: '06/05/2026 08:30', module: 'IMPORT_EXCEL', action: 'PREVIEW_CREATED', objectType: 'import_batch', status: 'Traçé', actor: 'admin@banque.local' },
  { id: 'audit-2', createdAt: '06/05/2026 08:45', module: 'WORKFLOW', action: 'STATUS_CHANGED', objectType: 'recommendation', status: 'Traçé', actor: 'risk@banque.local' },
];

export default function Page() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Audit log</h1>
        <p className="mt-2 text-slate-600">Journal bancaire immuable des imports, mappings, validations, changements de statut et opérations sensibles.</p>
      </div>
      <CrudWorkspace title="Consultation et export de l’audit" description="Par principe technique, l’audit log reste en lecture seule : pas de modification ni suppression, mais recherche, tri et export pour contrôle permanent." fields={fields} initialRows={rows} columns={['createdAt', 'module', 'action', 'objectType', 'status', 'actor']} statusField="status" readonly enabledViews={['read', 'export', 'audit']} />
    </section>
  );
}

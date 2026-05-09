import { CrudWorkspace, type CrudField, type CrudRecord } from '@/components/crud-workspace';

const fields: CrudField[] = [
  { key: 'role', label: 'Rôle', required: true },
  { key: 'permissions', label: 'Permissions', type: 'textarea', required: true },
  { key: 'status', label: 'Statut', type: 'select', required: true, options: ['Actif', 'Inactif'] },
  { key: 'module', label: 'Module', type: 'select', options: ['RBAC', 'Workflow', 'Import Excel', 'Relances', 'Référentiels'] },
];

const rows: CrudRecord[] = [
  { id: 'role-1', role: 'Admin', permissions: 'Toutes permissions', status: 'Actif', module: 'RBAC' },
  { id: 'role-2', role: 'Risk Manager', permissions: 'Validation, reporting, workflow', status: 'Actif', module: 'Workflow' },
  { id: 'role-3', role: 'Auditeur', permissions: 'Création missions et recommandations', status: 'Actif', module: 'RBAC' },
  { id: 'role-4', role: 'Responsable métier', permissions: 'Actions, preuves, commentaires', status: 'Actif', module: 'Workflow' },
  { id: 'role-5', role: 'Lecteur', permissions: 'Consultation', status: 'Actif', module: 'RBAC' },
];

export default function Page() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Administration</h1>
        <p className="mt-2 text-slate-600">Paramétrage RBAC, workflows, mappings Excel, canevas, règles de relance et référentiels.</p>
      </div>
      <CrudWorkspace title="CRUD du paramétrage" description="Administrer les rôles et paramètres fonctionnels avec recherche, édition rapide, suppression contrôlée et export CSV." fields={fields} initialRows={rows} columns={['role', 'permissions', 'module', 'status']} statusField="status" enabledViews={['create', 'read', 'update', 'delete', 'export', 'audit']} />
    </section>
  );
}

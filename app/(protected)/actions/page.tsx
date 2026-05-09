import { CrudWorkspace, type CrudField, type CrudRecord } from '@/components/crud-workspace';

const fields: CrudField[] = [
  { key: 'recommendation', label: 'Reco', required: true },
  { key: 'title', label: 'Action', required: true },
  { key: 'owner', label: 'Responsable', required: true },
  { key: 'status', label: 'Statut', type: 'select', required: true, options: ['À lancer', 'En cours', 'En attente justificatif', 'Réalisée', 'Bloquée'] },
  { key: 'progress', label: 'Avancement %', type: 'number', required: true },
  { key: 'dueDate', label: 'Échéance', type: 'date', required: true },
  { key: 'evidenceRequired', label: 'Preuve requise', type: 'select', options: ['Oui', 'Non'] },
];

const rows: CrudRecord[] = [
  { id: 'action-1', recommendation: 'REC-2026-001', title: 'Mettre à jour la procédure KYC', owner: 'Responsable Conformité', status: 'En cours', progress: '70', dueDate: '2026-05-31', evidenceRequired: 'Oui' },
  { id: 'action-2', recommendation: 'REC-2026-002', title: 'Produire le rapport de contrôles', owner: 'Risk Manager', status: 'En attente justificatif', progress: '40', dueDate: '2026-06-15', evidenceRequired: 'Oui' },
];

export default function Page() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Plans d’action</h1>
        <p className="mt-2 text-slate-600">Suivi opérationnel des plans, responsables, jalons, preuves attendues et avancement pondéré.</p>
      </div>
      <CrudWorkspace title="CRUD des actions" description="Créer les actions de remédiation, mettre à jour leur avancement, supprimer les doublons et exporter le plan consolidé." fields={fields} initialRows={rows} columns={['recommendation', 'title', 'owner', 'status', 'progress', 'dueDate']} statusField="status" />
    </section>
  );
}

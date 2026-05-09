import { CrudWorkspace, type CrudField, type CrudRecord } from '@/components/crud-workspace';
import { StatusBadge } from '@/components/ui';

const fields: CrudField[] = [
  { key: 'code', label: 'Code', required: true, placeholder: 'REC-2026-001' },
  { key: 'mission', label: 'Mission', required: true },
  { key: 'title', label: 'Recommandation', required: true },
  { key: 'entity', label: 'Entité', required: true },
  { key: 'status', label: 'Statut', type: 'select', required: true, options: ['Brouillon', 'Ouverte', 'En cours', 'En attente justificatif', 'Réalisée', 'Validée', 'Clôturée', 'Rejetée'] },
  { key: 'severity', label: 'Criticité', type: 'select', required: true, options: ['Faible', 'Moyenne', 'Haute', 'Critique'] },
  { key: 'dueDate', label: 'Échéance', type: 'date', required: true },
  { key: 'owner', label: 'Responsable', required: true },
  { key: 'expectedDeliverable', label: 'Livrable attendu', type: 'textarea' },
];

const rows: CrudRecord[] = [
  { id: 'reco-1', code: 'REC-2026-001', mission: 'M-IG-2026-04', title: 'Renforcer la revue KYC périodique', entity: 'Conformité', status: 'En cours', severity: 'Critique', dueDate: '2026-05-31', owner: 'Responsable Conformité', expectedDeliverable: 'Procédure KYC validée et preuves de contrôle.' },
  { id: 'reco-2', code: 'REC-2026-002', mission: 'M-RISK-2026-02', title: 'Formaliser les contrôles de dépassement', entity: 'Risques', status: 'En attente justificatif', severity: 'Haute', dueDate: '2026-06-15', owner: 'Risk Manager', expectedDeliverable: 'Rapport de contrôles mensuel.' },
  { id: 'reco-3', code: 'REC-2026-003', mission: 'M-AUD-2026-01', title: 'Mettre à jour la matrice de délégation', entity: 'Opérations', status: 'Réalisée', severity: 'Moyenne', dueDate: '2026-06-20', owner: 'Directeur Opérations', expectedDeliverable: 'Matrice publiée.' },
];

export default function Page() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Recommandations</h1>
        <p className="mt-2 text-slate-600">Registre central avec recherche, filtres, tri, export, badges de statut, criticité, retard et priorité.</p>
      </div>
      <CrudWorkspace title="CRUD des recommandations" description="Gestion complète des recommandations avec contrôle des champs clés, préparation des workflows et export comité." fields={fields} initialRows={rows} columns={['code', 'mission', 'title', 'entity', 'status', 'severity', 'dueDate']} statusField="status">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><StatusBadge tone="red">Priorité</StatusBadge><p className="mt-2">Les criticités haute et critique sont immédiatement visibles.</p></div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><StatusBadge tone="blue">Workflow</StatusBadge><p className="mt-2">Les statuts sont alignés sur le cycle brouillon → clôture.</p></div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><StatusBadge tone="emerald">Traçabilité</StatusBadge><p className="mt-2">Chaque opération est prête pour audit log côté serveur.</p></div>
        </div>
      </CrudWorkspace>
    </section>
  );
}

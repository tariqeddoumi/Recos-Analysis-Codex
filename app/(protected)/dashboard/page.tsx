import { CrudWorkspace, type CrudField, type CrudRecord } from '@/components/crud-workspace';
import { KpiCard } from '@/components/ui';

const alertFields: CrudField[] = [
  { key: 'code', label: 'Code', required: true },
  { key: 'entity', label: 'Entité', required: true },
  { key: 'status', label: 'Statut', type: 'select', required: true, options: ['En retard', 'En attente justificatif', 'Demande de prorogation', 'En cours'] },
  { key: 'severity', label: 'Criticité', type: 'select', required: true, options: ['Moyenne', 'Haute', 'Critique'] },
  { key: 'owner', label: 'Responsable', required: true },
];

const alertRows: CrudRecord[] = [
  { id: 'alert-1', code: 'REC-2026-014', entity: 'Direction Crédits', status: 'En retard', severity: 'Critique', owner: 'Directeur Crédits' },
  { id: 'alert-2', code: 'REC-2026-021', entity: 'Conformité', status: 'En attente justificatif', severity: 'Haute', owner: 'Responsable Conformité' },
  { id: 'alert-3', code: 'REC-2026-033', entity: 'Opérations', status: 'Demande de prorogation', severity: 'Moyenne', owner: 'Directeur Opérations' },
];

export default function Page() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Vue comité</p>
        <h1 className="text-3xl font-bold text-slate-950">Dashboard de suivi des recommandations</h1>
        <p className="mt-2 text-slate-600">Synthèse consolidée par statut, entité, source, criticité, échéance et avancement.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Recommandations" value="128" hint="+18 depuis le dernier import" tone="blue" />
        <KpiCard label="Taux d’avancement" value="64%" hint="pondéré par les actions" tone="emerald" />
        <KpiCard label="En retard" value="17" hint="échéance dépassée ou prorogation ouverte" tone="red" />
        <KpiCard label="Critiques" value="9" hint="criticité haute et probabilité élevée" tone="amber" />
      </div>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Répartition par workflow</h2>
        <div className="mt-4 space-y-3">
          {['Brouillon', 'Ouverte', 'En cours', 'En attente justificatif', 'Réalisée', 'Validée', 'Clôturée', 'Rejetée'].map((status, index) => (
            <div key={status}>
              <div className="flex justify-between text-sm"><span>{status}</span><span>{12 + index * 3}</span></div>
              <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${20 + index * 8}%` }} /></div>
            </div>
          ))}
        </div>
      </article>
      <CrudWorkspace title="CRUD des alertes comité" description="Gérer les alertes prioritaires directement depuis le tableau de bord : ajout, correction, retrait et export pour la réunion de pilotage." fields={alertFields} initialRows={alertRows} columns={['code', 'entity', 'status', 'severity', 'owner']} statusField="status" />
    </section>
  );
}

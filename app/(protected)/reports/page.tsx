import { CrudWorkspace, type CrudField, type CrudRecord } from '@/components/crud-workspace';
import { KpiCard } from '@/components/ui';

const fields: CrudField[] = [
  { key: 'name', label: 'Vue / export', required: true },
  { key: 'format', label: 'Format', type: 'select', required: true, options: ['XLSX', 'PDF', 'Word', 'Dashboard'] },
  { key: 'scope', label: 'Périmètre', required: true },
  { key: 'frequency', label: 'Fréquence', type: 'select', required: true, options: ['À la demande', 'Hebdomadaire', 'Mensuelle', 'Comité'] },
  { key: 'status', label: 'Statut', type: 'select', required: true, options: ['Actif', 'Brouillon', 'Archivé'] },
];

const rows: CrudRecord[] = [
  { id: 'report-1', name: 'Comité recommandations critiques', format: 'PDF', scope: 'Criticité haute et critique', frequency: 'Comité', status: 'Actif' },
  { id: 'report-2', name: 'Plan actions global', format: 'XLSX', scope: 'Toutes entités', frequency: 'Hebdomadaire', status: 'Actif' },
];

export default function Page() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Reporting</h1>
        <p className="mt-2 text-slate-600">Exports comité Excel, PDF ou Word, indicateurs par statut, entité, source, retard, criticité et échéances proches.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Par statut" value="8 vues" hint="workflow complet" tone="blue" />
        <KpiCard label="Exports" value="XLSX/PDF" hint="préparé côté serveur" tone="emerald" />
        <KpiCard label="Échéances proches" value="23" hint="30 prochains jours" tone="amber" />
      </div>
      <CrudWorkspace title="CRUD des vues de reporting" description="Créer et maintenir les modèles d’exports comité, changer leur format, archiver les vues obsolètes et exporter la liste de paramétrage." fields={fields} initialRows={rows} columns={['name', 'format', 'scope', 'frequency', 'status']} statusField="status" />
    </section>
  );
}

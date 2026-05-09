import { CrudWorkspace, type CrudField, type CrudRecord } from '@/components/crud-workspace';

const fields: CrudField[] = [
  { key: 'reference', label: 'Référence', required: true, placeholder: 'M-IG-2026-04' },
  { key: 'title', label: 'Titre', required: true },
  { key: 'source', label: 'Source', type: 'select', required: true, options: ['Inspection', 'Contrôle permanent', 'Audit interne', 'Régulateur'] },
  { key: 'entity', label: 'Entité', required: true },
  { key: 'status', label: 'Statut', type: 'select', required: true, options: ['Brouillon', 'Ouverte', 'Validée', 'Archivée'] },
  { key: 'recommendations', label: 'Recos', type: 'number', required: true },
  { key: 'startedAt', label: 'Début', type: 'date' },
  { key: 'endedAt', label: 'Fin', type: 'date' },
];

const rows: CrudRecord[] = [
  { id: 'mission-1', reference: 'M-IG-2026-04', title: 'Inspection générale crédits', source: 'Inspection', entity: 'Direction Crédits', status: 'Ouverte', recommendations: '42', startedAt: '2026-04-01', endedAt: '' },
  { id: 'mission-2', reference: 'M-RISK-2026-02', title: 'Revue dispositif risques', source: 'Contrôle permanent', entity: 'Risques', status: 'Validée', recommendations: '18', startedAt: '2026-02-15', endedAt: '2026-04-30' },
];

export default function Page() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Missions</h1>
        <p className="mt-2 text-slate-600">Pilotage complet des missions sources, entités responsables, confidentialité et rattachement des recommandations.</p>
      </div>
      <CrudWorkspace
        title="CRUD des missions"
        description="Créer, consulter, modifier, supprimer, trier et exporter les missions avant branchement persistant Prisma/Supabase. Les champs respectent le modèle Mission et préparent la gestion des statuts et des dates."
        fields={fields}
        initialRows={rows}
        columns={['reference', 'title', 'source', 'entity', 'status', 'recommendations']}
        statusField="status"
      />
    </section>
  );
}

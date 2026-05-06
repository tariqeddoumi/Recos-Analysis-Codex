import { DataTable, StatusBadge } from '@/components/ui';

const rows = [
  ['REC-2026-001', 'M-IG-2026-04', 'Renforcer la revue KYC périodique', 'Conformité', <StatusBadge key="s" tone="blue">En cours</StatusBadge>, <StatusBadge key="c" tone="red">Critique</StatusBadge>, '31/05/2026'],
  ['REC-2026-002', 'M-RISK-2026-02', 'Formaliser les contrôles de dépassement', 'Risques', <StatusBadge key="s" tone="amber">En attente justificatif</StatusBadge>, <StatusBadge key="c" tone="amber">Haute</StatusBadge>, '15/06/2026'],
  ['REC-2026-003', 'M-AUD-2026-01', 'Mettre à jour la matrice de délégation', 'Opérations', <StatusBadge key="s" tone="emerald">Réalisée</StatusBadge>, <StatusBadge key="c">Moyenne</StatusBadge>, '20/06/2026'],
];

export default function Page() {
  return <section className="space-y-6"><div><h1 className="text-3xl font-bold text-slate-950">Recommandations</h1><p className="mt-2 text-slate-600">Registre central avec recherche, filtres, tri, pagination, badges de statut, criticité, retard et priorité.</p></div><DataTable columns={['Code', 'Mission', 'Recommandation', 'Entité', 'Statut', 'Criticité', 'Échéance']} rows={rows} empty="Aucune recommandation." /><article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold">Fiche détail recommandation</h2><p className="mt-2 text-sm text-slate-600">La fiche détail consolide constat, risque, plan d’action, livrables attendus, commentaires, preuves, historique de statut et demandes de prorogation.</p></article></section>;
}

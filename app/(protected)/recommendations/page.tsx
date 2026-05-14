import { WorkspacePage } from '@/components/workspace-page';
import { StatusBadge } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <div className="space-y-4">
      <WorkspacePage resource="recommendations" heading="Recommandations" intro="Registre central branché à Prisma/Supabase avec workflow, commentaires, actions, preuves et export comité." />
      <article className="grid gap-3 md:grid-cols-4">
        <div className="rounded-xl bg-white p-3 text-sm text-slate-600 shadow-sm"><StatusBadge tone="blue">Détail</StatusBadge><p className="mt-2">Les lignes sont prêtes à ouvrir une fiche détail recommandation.</p></div>
        <div className="rounded-xl bg-white p-3 text-sm text-slate-600 shadow-sm"><StatusBadge tone="purple">Timeline</StatusBadge><p className="mt-2">Historique lu depuis recommendation_status_history.</p></div>
        <div className="rounded-xl bg-white p-3 text-sm text-slate-600 shadow-sm"><StatusBadge tone="emerald">Preuves</StatusBadge><p className="mt-2">Rattachement aux preuves et validations serveur.</p></div>
        <div className="rounded-xl bg-white p-3 text-sm text-slate-600 shadow-sm"><StatusBadge tone="amber">Prorogation</StatusBadge><p className="mt-2">Demandes tracées dans deadline_extensions.</p></div>
      </article>
    </div>
  );
}

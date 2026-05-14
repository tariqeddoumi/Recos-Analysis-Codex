import { KpiCard, StatusBadge } from '@/components/ui';
import { ReportingService } from '@/services/reporting.service';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const reporting = new ReportingService();
  const dashboard = await reporting.dashboard();
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Vue comité</p>
        <h1 className="text-3xl font-bold text-slate-950">Dashboard de suivi des recommandations</h1>
        <p className="mt-2 text-slate-600">KPI calculés depuis PostgreSQL/Supabase par statut, entité, source, criticité, échéance et avancement.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Recommandations" value={String(dashboard.kpis.recommendations)} hint="Total actif en base" tone="blue" />
        <KpiCard label="Taux d’avancement" value={`${dashboard.kpis.progress}%`} hint="Moyenne du progrès persistant" tone="emerald" />
        <KpiCard label="En retard" value={String(dashboard.kpis.overdue)} hint="Échéance dépassée non clôturée" tone="red" />
        <KpiCard label="Critiques" value={String(dashboard.kpis.critical)} hint="Criticité niveau élevé" tone="amber" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Répartition par statut" points={dashboard.byStatus} />
        <ChartCard title="Répartition par entité" points={dashboard.byEntity} />
        <ChartCard title="Répartition par source" points={dashboard.bySource} />
        <ChartCard title="Répartition par criticité" points={dashboard.bySeverity} />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <AlertCard title="Recommandations en retard" tone="red" rows={dashboard.overdue} />
        <AlertCard title="Échéances dans 30 jours" tone="amber" rows={dashboard.next30Days} />
        <AlertCard title="Recommandations critiques" tone="purple" rows={dashboard.critical} />
      </div>
    </section>
  );
}

function ChartCard({ title, points }: { title: string; points: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...points.map((point) => point.value));
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {points.length === 0 ? <p className="text-sm text-slate-500">Aucune donnée.</p> : points.map((point) => (
          <div key={point.label}>
            <div className="flex justify-between text-sm"><span>{point.label}</span><span>{point.value}</span></div>
            <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.max(6, (point.value / max) * 100)}%` }} /></div>
          </div>
        ))}
      </div>
    </article>
  );
}

function AlertCard({ title, tone, rows }: { title: string; tone: 'red' | 'amber' | 'purple'; rows: Array<{ id: string; code: string; title: string; entity: string; status: string; severity: string; dueDate: string }> }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">{title}</h2><StatusBadge tone={tone}>{rows.length}</StatusBadge></div>
      <div className="space-y-3">
        {rows.length === 0 ? <p className="text-sm text-slate-500">Aucune alerte.</p> : rows.map((row) => (
          <div key={row.id} className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="font-semibold text-slate-900">{row.code} · {row.title}</p>
            <p className="mt-1 text-slate-600">{row.entity} · {row.status} · {row.severity} · {row.dueDate}</p>
          </div>
        ))}
      </div>
    </article>
  );
}

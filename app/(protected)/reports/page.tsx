import { KpiCard, StatusBadge } from '@/components/ui';
import { ReportingService } from '@/services/reporting.service';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const reporting = new ReportingService();
  const dashboard = await reporting.dashboard();
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Reporting comité</h1>
        <p className="mt-2 text-slate-600">Exports comité branchés à la base, filtres consolidés et tableaux dynamiques par période, entité, source, statut et criticité.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Excel comité" value="XLSX" hint="Export CSV compatible Excel réel" tone="emerald" />
        <KpiCard label="PDF synthétique" value="PDF" hint="Endpoint prêt pour génération PDF serveur" tone="red" />
        <KpiCard label="Note comité" value="Word" hint="Endpoint prêt pour génération DOCX" tone="blue" />
      </div>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Exports opérationnels</h2>
            <p className="text-sm text-slate-600">Les exports utilisent les mêmes requêtes que le dashboard et l’audit log.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/api/reports/committee?format=excel" className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">Exporter Excel comité</a>
            <a href="/api/reports/committee?format=pdf" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Exporter PDF</a>
            <a href="/api/reports/committee?format=word" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Exporter Word</a>
          </div>
        </div>
      </article>
      <div className="grid gap-4 xl:grid-cols-2">
        <Consolidated title="Statuts" rows={dashboard.byStatus} />
        <Consolidated title="Criticités" rows={dashboard.bySeverity} />
      </div>
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Filtres disponibles</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Période', 'Entité', 'Source', 'Statut', 'Criticité', 'Responsable', 'Échéance'].map((filter) => <StatusBadge key={filter} tone="blue">{filter}</StatusBadge>)}
        </div>
      </article>
    </section>
  );
}

function Consolidated({ title, rows }: { title: string; rows: Array<{ label: string; value: number }> }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Tableau consolidé · {title}</h2>
      <div className="mt-4 divide-y divide-slate-100">
        {rows.length === 0 ? <p className="text-sm text-slate-500">Aucune donnée.</p> : rows.map((row) => <div key={row.label} className="flex justify-between py-2 text-sm"><span>{row.label}</span><strong>{row.value}</strong></div>)}
      </div>
    </article>
  );
}

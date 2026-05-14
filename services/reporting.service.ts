import { prisma } from '@/lib/prisma/client';

export type ChartPoint = { label: string; value: number };
export type CommitteeAlert = { id: string; code: string; title: string; entity: string; status: string; severity: string; dueDate: string; owner: string };

export class ReportingService {
  async dashboard() {
    const [kpis] = await prisma.$queryRaw<[{ recommendations: number; progress: number; overdue: number; critical: number }]>`
      select count(*)::int as recommendations,
        coalesce(round(avg(r.progress)), 0)::int as progress,
        count(*) filter (where coalesce(r.due_date_revised, r.due_date_initial) < current_date and ps.code not in ('CLOTUREE','VALIDEE'))::int as overdue,
        count(*) filter (where coalesce(sl.level, 0) >= 4)::int as critical
      from suivi_reco.recommendations r
      left join suivi_reco.parameter_settings ps on ps.id = r.status_id
      left join suivi_reco.severity_levels sl on sl.id = r.severity_level_id
      where coalesce(r.is_archived, false) = false`;
    return {
      kpis: kpis ?? { recommendations: 0, progress: 0, overdue: 0, critical: 0 },
      byStatus: await this.chart('status'),
      byEntity: await this.chart('entity'),
      bySource: await this.chart('source'),
      bySeverity: await this.chart('severity'),
      overdue: await this.alerts('overdue'),
      next30Days: await this.alerts('next30'),
      critical: await this.alerts('critical'),
    };
  }

  async chart(kind: 'status' | 'entity' | 'source' | 'severity') {
    const sql = {
      status: `select coalesce(ps.label, ps.code, 'Non renseigné') as label, count(*)::int as value from suivi_reco.recommendations r left join suivi_reco.parameter_settings ps on ps.id = r.status_id group by 1 order by 2 desc`,
      entity: `select coalesce(e.label, 'Non renseigné') as label, count(*)::int as value from suivi_reco.recommendations r join suivi_reco.missions m on m.id = r.mission_id left join suivi_reco.entities e on e.id = m.entity_id group by 1 order by 2 desc`,
      source: `select coalesce(st.label, st.code, 'Non renseigné') as label, count(*)::int as value from suivi_reco.recommendations r left join suivi_reco.source_types st on st.id = r.source_type_id group by 1 order by 2 desc`,
      severity: `select coalesce(sl.label, sl.code, 'Non renseigné') as label, count(*)::int as value from suivi_reco.recommendations r left join suivi_reco.severity_levels sl on sl.id = r.severity_level_id group by 1 order by 2 desc`,
    }[kind];
    return prisma.$queryRawUnsafe<ChartPoint[]>(sql);
  }

  async alerts(kind: 'overdue' | 'next30' | 'critical') {
    const condition = {
      overdue: `coalesce(r.due_date_revised, r.due_date_initial) < current_date`,
      next30: `coalesce(r.due_date_revised, r.due_date_initial) between current_date and current_date + interval '30 days'`,
      critical: `coalesce(sl.level, 0) >= 4`,
    }[kind];
    return prisma.$queryRawUnsafe<CommitteeAlert[]>(`
      select r.id::text, r.code, coalesce(r.title, r.observation, '') as title, coalesce(e.label, '') as entity,
        coalesce(ps.label, ps.code, '') as status, coalesce(sl.label, sl.code, '') as severity,
        coalesce(to_char(coalesce(r.due_date_revised, r.due_date_initial), 'YYYY-MM-DD'), '') as "dueDate", coalesce(r.owner_name, '') as owner
      from suivi_reco.recommendations r
      join suivi_reco.missions m on m.id = r.mission_id
      left join suivi_reco.entities e on e.id = m.entity_id
      left join suivi_reco.parameter_settings ps on ps.id = r.status_id
      left join suivi_reco.severity_levels sl on sl.id = r.severity_level_id
      where ${condition}
      order by coalesce(r.due_date_revised, r.due_date_initial) asc nulls last
      limit 10`);
  }

  async committeeCsv() {
    const rows = await this.alerts('next30');
    return ['Code;Titre;Entité;Statut;Criticité;Échéance;Responsable', ...rows.map((row) => [row.code, row.title, row.entity, row.status, row.severity, row.dueDate, row.owner].map(csv).join(';'))].join('\n');
  }

  async healthcheck() {
    await prisma.$queryRaw`SELECT 1`;
    return { module: 'reporting', ok: true };
  }
}

function csv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

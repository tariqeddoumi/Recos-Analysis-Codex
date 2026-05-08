import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { validateImportRows, type RawImportRow } from '@/lib/import/import-processing';
import { confirmImportSchema, parsedRecommendationRowSchema } from '@/lib/validators/import.validator';

export const runtime = 'nodejs';

type ImportRow = { id: string; line_number: number; raw_data: RawImportRow; mapped_data: Record<string, unknown>; status: string };

function slug(value: unknown, fallback: string) {
  const base = String(value || fallback).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toUpperCase();
  return base || fallback;
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = confirmImportSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: 'Demande de confirmation invalide.' }, { status: 400 });

  let rows: ImportRow[] = await prisma.$queryRaw<ImportRow[]>`
    select id, line_number, raw_data, mapped_data, status from suivi_reco.import_rows
    where batch_id = ${parsed.data.batchId}::uuid
    order by line_number asc
  `;

  if (parsed.data.mapping) {
    const revalidatedRows = validateImportRows(rows.map((row) => row.raw_data), parsed.data.mapping);
    const summary = {
      total: revalidatedRows.length,
      valid: revalidatedRows.filter((row) => row.status === 'VALID').length,
      rejected: revalidatedRows.filter((row) => row.status === 'REJECTED').length,
    };

    await prisma.$executeRaw`delete from suivi_reco.import_errors where batch_id = ${parsed.data.batchId}::uuid`;
    await prisma.$executeRaw`
      update suivi_reco.import_batches
      set mapping = ${JSON.stringify(parsed.data.mapping)}::jsonb, total_rows = ${summary.total}, valid_rows = ${summary.valid}, rejected_rows = ${summary.rejected}
      where id = ${parsed.data.batchId}::uuid
    `;

    for (const [index, revalidatedRow] of revalidatedRows.entries()) {
      const rowId = rows[index]?.id;
      await prisma.$executeRaw`
        update suivi_reco.import_rows
        set mapped_data = ${JSON.stringify(revalidatedRow.mapped)}::jsonb, status = ${revalidatedRow.status}
        where id = ${rowId}::uuid
      `;

      for (const error of revalidatedRow.errors) {
        await prisma.$executeRaw`
          insert into suivi_reco.import_errors (batch_id, row_id, line_number, field_name, message)
          values (${parsed.data.batchId}::uuid, ${rowId}::uuid, ${revalidatedRow.lineNumber}, null, ${error})
        `;
      }
    }

    rows = rows.map((row, index) => ({ ...row, mapped_data: revalidatedRows[index]?.mapped ?? row.mapped_data, status: revalidatedRows[index]?.status ?? row.status }));
  }

  rows = rows.filter((row) => row.status === 'VALID' && parsedRecommendationRowSchema.safeParse(row.mapped_data).success);

  let imported = 0;
  const rejected: { lineNumber: number; message: string }[] = [];

  for (const row of rows) {
    const mapped = parsedRecommendationRowSchema.safeParse(row.mapped_data);
    if (!mapped.success) {
      rejected.push({ lineNumber: row.line_number, message: 'Ligne invalide au moment de la confirmation.' });
      continue;
    }

    const data = mapped.data;
    const duplicate = await prisma.$queryRaw<{ id: string }[]>`
      select r.id from suivi_reco.recommendations r
      join suivi_reco.missions m on m.id = r.mission_id
      where lower(r.code) = lower(${data.recommendationCode || slug(data.recommendation, `REC-${row.line_number}`)})
         or (lower(m.reference) = lower(${data.missionReference}) and lower(coalesce(r.title, '')) = lower(${data.recommendation}))
      limit 1
    `;

    if (duplicate.length > 0) {
      rejected.push({ lineNumber: row.line_number, message: 'Doublon détecté avec les recommandations existantes.' });
      await prisma.$executeRaw`update suivi_reco.import_rows set status = 'REJECTED' where id = ${row.id}::uuid`;
      continue;
    }

    await prisma.$executeRaw`
      insert into suivi_reco.entities (code, label)
      values (${slug(data.entity, `ENT-${row.line_number}`)}, ${data.entity})
      on conflict (code) do nothing
    `;
    await prisma.$executeRaw`
      insert into suivi_reco.missions (reference, title, source_type_id, entity_id, status_id, confidentiality_level_id)
      values (
        ${data.missionReference},
        ${`Mission ${data.missionReference}`},
        (select id from suivi_reco.source_types order by coefficient desc limit 1),
        (select id from suivi_reco.entities where code = ${slug(data.entity, `ENT-${row.line_number}`)} limit 1),
        (select id from suivi_reco.parameter_settings where domain = 'WORKFLOW_STATUS' and code = 'OUVERTE' limit 1),
        (select id from suivi_reco.confidentiality_levels order by rank asc limit 1)
      ) on conflict (reference) do nothing
    `;
    const recommendationRows = await prisma.$queryRaw<{ id: string }[]>`
      insert into suivi_reco.recommendations (code, mission_id, source_type_id, risk_type_id, severity_level_id, probability_level_id, confidentiality_level_id, status_id, title, observation, owner_name, expected_deliverable, due_date_initial, due_date_revised, priority_class)
      values (
        ${data.recommendationCode || slug(data.recommendation, `REC-${row.line_number}`)},
        (select id from suivi_reco.missions where reference = ${data.missionReference}),
        coalesce((select id from suivi_reco.source_types where lower(label) = lower(${data.source}) or lower(code) = lower(${data.source}) limit 1), (select id from suivi_reco.source_types order by coefficient desc limit 1)),
        coalesce((select id from suivi_reco.risk_types where lower(label) = lower(${data.risk}) or lower(code) = lower(${data.risk}) limit 1), (select id from suivi_reco.risk_types order by code asc limit 1)),
        coalesce((select id from suivi_reco.severity_levels where lower(label) = lower(${data.severity}) or lower(code) = lower(${data.severity}) order by level desc limit 1), (select id from suivi_reco.severity_levels order by level desc limit 1)),
        (select id from suivi_reco.probability_levels order by level desc limit 1),
        (select id from suivi_reco.confidentiality_levels order by rank asc limit 1),
        coalesce((select id from suivi_reco.parameter_settings where domain = 'WORKFLOW_STATUS' and lower(label) = lower(${data.status}) limit 1), (select id from suivi_reco.parameter_settings where domain = 'WORKFLOW_STATUS' and code = 'OUVERTE' limit 1)),
        ${data.recommendation}, ${data.observation}, ${data.owner}, nullif(${data.expectedDeliverable || ''}, ''), ${data.dueDateInitial}::date, nullif(${data.dueDateRevised || ''}, '')::date, ${data.priority}
      ) returning id
    `;

    const recommendationId = recommendationRows[0]?.id;
    if (data.actionPlan) {
      await prisma.$executeRaw`
        insert into suivi_reco.actions (recommendation_id, title, status_id, owner_name, due_date)
        values (${recommendationId}::uuid, ${data.actionPlan}, (select id from suivi_reco.parameter_settings where domain = 'WORKFLOW_STATUS' and code = 'EN_COURS' limit 1), ${data.owner}, nullif(${data.dueDateRevised || data.dueDateInitial}, '')::date)
      `;
    }
    if (data.comment) {
      await prisma.$executeRaw`insert into suivi_reco.recommendation_comments (recommendation_id, author_name, comment) values (${recommendationId}::uuid, ${data.stakeholder || data.owner}, ${data.comment})`;
    }
    if (data.stakeholder) {
      await prisma.$executeRaw`insert into suivi_reco.stakeholder_inputs (recommendation_id, stakeholder_name, input_payload) values (${recommendationId}::uuid, ${data.stakeholder}, ${JSON.stringify(data)}::jsonb)`;
    }
    await prisma.$executeRaw`insert into suivi_reco.recommendation_status_history (recommendation_id, status_code, comment) values (${recommendationId}::uuid, ${data.status}, 'Créé depuis import Excel')`;
    await prisma.$executeRaw`update suivi_reco.import_rows set status = 'IMPORTED' where id = ${row.id}::uuid`;
    imported += 1;
  }

  const rejectedCountRows = await prisma.$queryRaw<{ count: number }[]>`
    select count(*)::int as count from suivi_reco.import_rows where batch_id = ${parsed.data.batchId}::uuid and status = 'REJECTED'
  `;
  const finalRejectedRows = rejectedCountRows[0]?.count ?? rejected.length;

  await prisma.$executeRaw`
    update suivi_reco.import_batches set status = ${finalRejectedRows ? 'PARTIALLY_IMPORTED' : 'IMPORTED'}, imported_rows = ${imported}, rejected_rows = ${finalRejectedRows}, confirmed_at = now() where id = ${parsed.data.batchId}::uuid
  `;
  await prisma.$executeRaw`
    insert into suivi_reco.audit_logs (module, action, object_type, object_id, new_value)
    values ('IMPORT_EXCEL', 'CONFIRMED', 'import_batch', ${parsed.data.batchId}, ${JSON.stringify({ imported, rejected })}::jsonb)
  `;

  return NextResponse.json({ imported, rejected, rejectedRows: finalRejectedRows });
}

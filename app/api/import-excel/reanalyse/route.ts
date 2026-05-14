import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { validateImportRows, type RawImportRow } from '@/lib/import/import-processing';
import { reanalyseImportSchema } from '@/lib/validators/import.validator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const parsed = reanalyseImportSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Demande de réanalyse invalide.' }, { status: 400 });

  const rows = await prisma.$queryRaw<{ id: string; line_number: number; raw_data: RawImportRow }[]>`
    select id, line_number, raw_data from suivi_reco.import_rows where batch_id = ${parsed.data.batchId}::uuid order by line_number asc`;
  const correctedRawRows = rows.map((row) => ({ ...row.raw_data, ...(parsed.data.corrections[row.id] ?? parsed.data.corrections[String(row.line_number)] ?? {}) }));
  const validatedRows = validateImportRows(correctedRawRows, parsed.data.mapping);
  const summary = { total: validatedRows.length, valid: validatedRows.filter((row) => row.status === 'VALID').length, rejected: validatedRows.filter((row) => row.status === 'REJECTED').length };

  await prisma.$executeRaw`delete from suivi_reco.import_errors where batch_id = ${parsed.data.batchId}::uuid`;
  for (const [index, row] of validatedRows.entries()) {
    const rowId = rows[index]?.id;
    await prisma.$executeRaw`
      update suivi_reco.import_rows set raw_data = ${JSON.stringify(row.rawRow)}::jsonb, mapped_data = ${JSON.stringify(row.mapped)}::jsonb, corrected_data = ${JSON.stringify(parsed.data.corrections[rowId] ?? parsed.data.corrections[String(rows[index]?.line_number)] ?? {})}::jsonb, status = ${row.status}
      where id = ${rowId}::uuid`;
    for (const error of row.errors) {
      await prisma.$executeRaw`insert into suivi_reco.import_errors (batch_id, row_id, line_number, field_name, message) values (${parsed.data.batchId}::uuid, ${rowId}::uuid, ${row.lineNumber}, null, ${error})`;
    }
  }
  await prisma.$executeRaw`update suivi_reco.import_batches set mapping = ${JSON.stringify(parsed.data.mapping)}::jsonb, total_rows = ${summary.total}, valid_rows = ${summary.valid}, rejected_rows = ${summary.rejected} where id = ${parsed.data.batchId}::uuid`;
  await prisma.$executeRaw`insert into suivi_reco.audit_logs (module, action, object_type, object_id, new_value) values ('IMPORT_EXCEL', 'REANALYSED', 'import_batch', ${parsed.data.batchId}, ${JSON.stringify(summary)}::jsonb)`;
  return NextResponse.json({ rows: validatedRows.slice(0, 100), summary });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { detectColumnMapping } from '@/lib/import/excel-fields';
import { summarizeRows, validateImportRows, type RawImportRow } from '@/lib/import/import-processing';
import { uploadImportSchema } from '@/lib/validators/import.validator';

export const runtime = 'nodejs';

const PREVIEW_LIMIT = 100;

type XlsxModule = {
  read: (data: Buffer, options: { type: 'buffer'; cellDates: boolean }) => { SheetNames: string[]; Sheets: Record<string, unknown> };
  utils: { sheet_to_json: (sheet: unknown, options: { defval: string; raw: boolean }) => RawImportRow[] };
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');
  const importType = formData.get('importType');
  const parsed = uploadImportSchema.safeParse({ importType });

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Fichier Excel obligatoire.' }, { status: 400 });
  }

  if (!parsed.success) {
    return NextResponse.json({ error: 'Type d’import invalide.' }, { status: 400 });
  }

  if (!/\.(xlsx|xls)$/i.test(file.name)) {
    return NextResponse.json({ error: 'Seuls les fichiers .xlsx et .xls sont acceptés.' }, { status: 400 });
  }

  const workbookBuffer = Buffer.from(await file.arrayBuffer());
  const xlsx = (await import('xlsx')) as XlsxModule;
  const workbook = xlsx.read(workbookBuffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const rawRows = sheetName ? xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '', raw: false }) : [];
  const headers = Array.from(new Set(rawRows.flatMap((row) => Object.keys(row))));
  const mapping = detectColumnMapping(headers);
  const validatedRows = validateImportRows(rawRows, mapping);
  const summary = summarizeRows(validatedRows);

  const batchRows = await prisma.$queryRaw<{ id: string }[]>`
    insert into suivi_reco.import_batches (file_name, import_type, status, detected_columns, mapping, total_rows, valid_rows, rejected_rows)
    values (${file.name}, ${parsed.data.importType}, 'PREVIEW', ${JSON.stringify(headers)}::jsonb, ${JSON.stringify(mapping)}::jsonb, ${summary.total}, ${summary.valid}, ${summary.rejected})
    returning id
  `;
  const batchId = batchRows[0]?.id;

  for (const row of validatedRows) {
    const insertedRows = await prisma.$queryRaw<{ id: string }[]>`
      insert into suivi_reco.import_rows (batch_id, line_number, raw_data, mapped_data, status)
      values (${batchId}::uuid, ${row.lineNumber}, ${JSON.stringify(row.rawRow)}::jsonb, ${JSON.stringify(row.mapped)}::jsonb, ${row.status})
      returning id
    `;

    for (const error of row.errors) {
      await prisma.$executeRaw`
        insert into suivi_reco.import_errors (batch_id, row_id, line_number, field_name, message)
        values (${batchId}::uuid, ${insertedRows[0]?.id}::uuid, ${row.lineNumber}, null, ${error})
      `;
    }
  }

  await prisma.$executeRaw`
    insert into suivi_reco.audit_logs (module, action, object_type, object_id, new_value)
    values ('IMPORT_EXCEL', 'PREVIEW_CREATED', 'import_batch', ${batchId}, ${JSON.stringify({ fileName: file.name, importType: parsed.data.importType, totalRows: summary.total })}::jsonb)
  `;

  return NextResponse.json({
    batchId,
    sheetName,
    headers,
    mapping,
    rows: validatedRows.slice(0, PREVIEW_LIMIT),
    summary,
    previewLimit: PREVIEW_LIMIT,
  });
}

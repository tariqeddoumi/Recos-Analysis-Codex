import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ batchId: z.string().uuid() });

export async function GET(request: Request) {
  const parsed = schema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'Batch invalide.' }, { status: 400 });
  const errors = await prisma.$queryRaw<{ line_number: number; field_name: string | null; message: string; severity: string }[]>`
    select line_number, field_name, message, severity from suivi_reco.import_errors where batch_id = ${parsed.data.batchId}::uuid order by line_number asc`;
  const csv = ['Ligne;Champ;Sévérité;Message', ...errors.map((error) => [error.line_number, error.field_name ?? '', error.severity, error.message].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(';'))].join('\n');
  return new NextResponse(csv, { headers: { 'content-type': 'text/csv;charset=utf-8', 'content-disposition': 'attachment; filename="erreurs-import.csv"' } });
}

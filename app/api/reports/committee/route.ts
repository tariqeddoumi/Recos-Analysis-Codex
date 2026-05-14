import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ReportingService } from '@/services/reporting.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ format: z.enum(['excel', 'pdf', 'word']).default('excel') });

export async function GET(request: Request) {
  const parsed = schema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'Format invalide.' }, { status: 400 });
  const service = new ReportingService();
  if (parsed.data.format === 'excel') {
    const csv = await service.committeeCsv();
    return new NextResponse(csv, { headers: { 'content-type': 'text/csv;charset=utf-8', 'content-disposition': 'attachment; filename="reporting-comite.csv"' } });
  }
  const body = parsed.data.format === 'pdf' ? 'Synthèse PDF comité à générer côté serveur depuis les données consolidées.' : 'Note Word comité à générer côté serveur depuis les données consolidées.';
  return new NextResponse(body, { headers: { 'content-type': 'text/plain;charset=utf-8' } });
}

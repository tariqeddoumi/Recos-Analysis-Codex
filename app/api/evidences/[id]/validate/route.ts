import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ decision: z.enum(['VALIDEE', 'REJETEE']), comment: z.string().optional() });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Décision invalide.' }, { status: 400 });
  await prisma.$executeRaw`
    update suivi_reco.evidences set validation_status_id = (select id from suivi_reco.parameter_settings where code = ${parsed.data.decision} limit 1) where id = ${id}::uuid`;
  await prisma.$executeRaw`insert into suivi_reco.audit_logs (module, action, object_type, object_id, new_value) values ('EVIDENCE', ${parsed.data.decision}, 'evidence', ${id}, ${JSON.stringify(parsed.data)}::jsonb)`;
  return NextResponse.json({ ok: true });
}

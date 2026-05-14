import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ recommendationCode: z.string().min(1), title: z.string().min(1) });
const BUCKET = process.env.SUPABASE_EVIDENCE_BUCKET ?? 'evidences';

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = schema.safeParse({ recommendationCode: formData.get('recommendationCode'), title: formData.get('title') });
  const file = formData.get('file');
  if (!parsed.success) return NextResponse.json({ error: 'Métadonnées invalides.' }, { status: 400 });
  if (!(file instanceof File)) return NextResponse.json({ error: 'Fichier obligatoire.' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileHash = `sha256:${createHash('sha256').update(buffer).digest('hex')}`;
  const recommendationRows = await prisma.$queryRaw<{ id: string }[]>`select id::text from suivi_reco.recommendations where lower(code) = lower(${parsed.data.recommendationCode}) limit 1`;
  const recommendationId = recommendationRows[0]?.id;
  if (!recommendationId) return NextResponse.json({ error: 'Recommandation introuvable.' }, { status: 404 });

  const versions = await prisma.$queryRaw<{ version: number }[]>`select coalesce(max(version), 0)::int + 1 as version from suivi_reco.evidences where recommendation_id = ${recommendationId}::uuid and title = ${parsed.data.title}`;
  const version = versions[0]?.version ?? 1;
  const storagePath = `${parsed.data.recommendationCode}/${version}-${file.name}`;
  const upload = await createSupabaseServerClient().storage.from(BUCKET).upload(storagePath, buffer, { contentType: file.type || 'application/octet-stream', upsert: true });
  if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 });

  await prisma.$executeRaw`
    insert into suivi_reco.evidences (recommendation_id, evidence_type_id, title, storage_path, version, validation_status_id, uploaded_by, file_hash)
    values (${recommendationId}::uuid,
      (select id from suivi_reco.parameter_settings where domain = 'EVIDENCE_TYPE' order by created_at asc limit 1),
      ${parsed.data.title}, ${storagePath}, ${version},
      (select id from suivi_reco.parameter_settings where domain in ('EVIDENCE_STATUS','WORKFLOW_STATUS') and code in ('A_VALIDER','EN_ATTENTE_JUSTIFICATIF') order by domain asc limit 1),
      '00000000-0000-0000-0000-000000000000', ${fileHash})`;
  await prisma.$executeRaw`insert into suivi_reco.audit_logs (module, action, object_type, object_id, new_value) values ('EVIDENCE', 'UPLOAD', 'evidence', ${recommendationId}, ${JSON.stringify({ storagePath, version, fileHash })}::jsonb)`;
  return NextResponse.json({ storagePath, version, fileHash });
}

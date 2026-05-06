import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export const runtime = 'nodejs';

export async function GET() {
  const batches = await prisma.$queryRaw`
    select id, file_name, import_type, status, total_rows, valid_rows, rejected_rows, imported_rows, created_at, confirmed_at
    from suivi_reco.import_batches
    order by created_at desc
    limit 25
  `;
  return NextResponse.json({ batches });
}

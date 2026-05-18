import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requirePermission } from '@/lib/auth/rbac';
import { createWorkspaceRow, exportWorkspaceCsv, listWorkspaceRows, workspaceConfigs, type WorkspaceResource } from '@/lib/workspace/resources';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const querySchema = z.object({
  search: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  format: z.enum(['json', 'csv']).optional(),
});

function parseResource(resource: string) {
  if (resource in workspaceConfigs) return resource as WorkspaceResource;
  throw new Error('Ressource inconnue.');
}

function moduleOf(resource: WorkspaceResource) {
  return resource.toUpperCase().replace('-', '_');
}

export async function GET(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource: rawResource } = await params;
  const resource = parseResource(rawResource);
  await requirePermission(moduleOf(resource), 'READ');
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 });
  if (parsed.data.format === 'csv') {
    await requirePermission(moduleOf(resource), 'EXPORT');
    const csv = await exportWorkspaceCsv(resource, parsed.data);
    return new NextResponse(csv, { headers: { 'content-type': 'text/csv;charset=utf-8', 'content-disposition': `attachment; filename="${resource}.csv"` } });
  }
  return NextResponse.json(await listWorkspaceRows(resource, parsed.data));
}

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  const { resource: rawResource } = await params;
  const resource = parseResource(rawResource);
  if (workspaceConfigs[resource].readonly) return NextResponse.json({ error: 'Lecture seule.' }, { status: 403 });
  await requirePermission(moduleOf(resource), 'CREATE');
  await createWorkspaceRow(resource, await request.json());
  return NextResponse.json({ ok: true }, { status: 201 });
}

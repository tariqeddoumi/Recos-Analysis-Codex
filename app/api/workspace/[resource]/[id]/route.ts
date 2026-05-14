import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/rbac';
import { deleteWorkspaceRow, updateWorkspaceRow, workspaceConfigs, type WorkspaceResource } from '@/lib/workspace/resources';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseResource(resource: string) {
  if (resource in workspaceConfigs) return resource as WorkspaceResource;
  throw new Error('Ressource inconnue.');
}

function moduleOf(resource: WorkspaceResource) {
  return resource.toUpperCase().replace('-', '_');
}

export async function PUT(request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource: rawResource, id } = await params;
  const resource = parseResource(rawResource);
  if (workspaceConfigs[resource].readonly) return NextResponse.json({ error: 'Lecture seule.' }, { status: 403 });
  await requirePermission(moduleOf(resource), 'UPDATE');
  await updateWorkspaceRow(resource, id, await request.json());
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource: rawResource, id } = await params;
  const resource = parseResource(rawResource);
  if (workspaceConfigs[resource].readonly) return NextResponse.json({ error: 'Lecture seule.' }, { status: 403 });
  await requirePermission(moduleOf(resource), 'DELETE');
  await deleteWorkspaceRow(resource, id);
  return NextResponse.json({ ok: true });
}

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';

const pagePermissions: Record<string, string> = {
  missions: 'MISSIONS:READ',
  recommendations: 'RECOMMENDATIONS:READ',
  actions: 'ACTIONS:READ',
  evidences: 'EVIDENCES:READ',
  reports: 'REPORTS:READ',
  admin: 'ADMIN:READ',
  'audit-log': 'AUDIT:READ',
};

export async function getCurrentUser() {
  const headerStore = await headers();
  const userId = headerStore.get('x-user-id');
  const email = headerStore.get('x-user-email');
  return { userId, email };
}

export async function requirePermission(module: string, action: string) {
  const { userId } = await getCurrentUser();
  if (!userId) throw new Error('Authentification requise.');
  const permissions = await prisma.$queryRaw<{ count: number }[]>`
    select count(*)::int as count
    from suivi_reco.users u
    join suivi_reco.user_roles ur on ur.user_id = u.id
    join suivi_reco.role_permissions rp on rp.role_id = ur.role_id
    join suivi_reco.permissions p on p.id = rp.permission_id
    where u.id = ${userId}::uuid and u.is_active = true and (p.code = ${`${module}:${action}`} or (p.module = ${module} and p.action = ${action}) or p.code = 'ADMIN:*')`;
  if ((permissions[0]?.count ?? 0) === 0) throw new Error('Permission insuffisante.');
  return { userId };
}

export async function requirePageAccess(page: keyof typeof pagePermissions) {
  const [module, action] = pagePermissions[page].split(':');
  return requirePermission(module, action);
}

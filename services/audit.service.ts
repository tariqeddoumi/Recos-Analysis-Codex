import { prisma } from '@/lib/prisma/client';

export class AuditService {
  async healthcheck() {
    await prisma.`SELECT 1`;
    return { module: 'audit', ok: true };
  }
}

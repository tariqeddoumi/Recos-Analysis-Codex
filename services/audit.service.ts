import { prisma } from '@/lib/prisma/client';

export class AuditService {
  async healthcheck() {
    await prisma.$queryRaw`SELECT 1`;
    return { module: 'audit', ok: true };
  }
}

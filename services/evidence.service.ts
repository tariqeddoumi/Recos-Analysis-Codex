import { prisma } from '@/lib/prisma/client';

export class EvidenceService {
  async healthcheck() {
    await prisma.$queryRaw`SELECT 1`;
    return { module: 'evidence', ok: true };
  }
}

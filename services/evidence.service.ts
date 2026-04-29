import { prisma } from '@/lib/prisma/client';

export class EvidenceService {
  async healthcheck() {
    await prisma.`SELECT 1`;
    return { module: 'evidence', ok: true };
  }
}

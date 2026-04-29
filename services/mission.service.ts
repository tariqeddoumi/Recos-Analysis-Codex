import { prisma } from '@/lib/prisma/client';

export class MissionService {
  async healthcheck() {
    await prisma.`SELECT 1`;
    return { module: 'mission', ok: true };
  }
}

import { prisma } from '@/lib/prisma/client';

export class MissionService {
  async healthcheck() {
    await prisma.$queryRaw`SELECT 1`;
    return { module: 'mission', ok: true };
  }
}

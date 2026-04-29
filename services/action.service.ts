import { prisma } from '@/lib/prisma/client';

export class ActionService {
  async healthcheck() {
    await prisma.$queryRaw`SELECT 1`;
    return { module: 'action', ok: true };
  }
}

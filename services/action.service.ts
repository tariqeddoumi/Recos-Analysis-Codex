import { prisma } from '@/lib/prisma/client';

export class ActionService {
  async healthcheck() {
    await prisma.`SELECT 1`;
    return { module: 'action', ok: true };
  }
}

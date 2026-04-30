import { prisma } from '@/lib/prisma/client';

export class NotificationService {
  async healthcheck() {
    await prisma.$queryRaw`SELECT 1`;
    return { module: 'notification', ok: true };
  }
}

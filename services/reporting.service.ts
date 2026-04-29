import { prisma } from '@/lib/prisma/client';

export class ReportingService {
  async healthcheck() {
    await prisma.$queryRaw`SELECT 1`;
    return { module: 'reporting', ok: true };
  }
}

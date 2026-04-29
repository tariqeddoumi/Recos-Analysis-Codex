import { prisma } from '@/lib/prisma/client';

export class ReportingService {
  async healthcheck() {
    await prisma.`SELECT 1`;
    return { module: 'reporting', ok: true };
  }
}

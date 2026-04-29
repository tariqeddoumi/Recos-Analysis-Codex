import { prisma } from '@/lib/prisma/client';

export class WorkflowService {
  async healthcheck() {
    await prisma.$queryRaw`SELECT 1`;
    return { module: 'workflow', ok: true };
  }
}

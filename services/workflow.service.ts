import { prisma } from '@/lib/prisma/client';

export class WorkflowService {
  async healthcheck() {
    await prisma.`SELECT 1`;
    return { module: 'workflow', ok: true };
  }
}

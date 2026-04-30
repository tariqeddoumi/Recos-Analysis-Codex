import { prisma } from '@/lib/prisma/client';

export class RecommendationService {
  async healthcheck() {
    await prisma.$queryRaw`SELECT 1`;
    return { module: 'recommendation', ok: true };
  }
}

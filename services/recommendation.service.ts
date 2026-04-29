import { prisma } from '@/lib/prisma/client';

export class RecommendationService {
  async healthcheck() {
    await prisma.`SELECT 1`;
    return { module: 'recommendation', ok: true };
  }
}

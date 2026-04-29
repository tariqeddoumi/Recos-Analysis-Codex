import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.parameterSetting.createMany({
    data: [
      { domain: 'MISSION_STATUS', code: 'BROUILLON', label: 'Brouillon', value: { order: 1 } },
      { domain: 'RECOMMENDATION_STATUS', code: 'OUVERTE', label: 'Ouverte', value: { order: 1 } },
      { domain: 'ACTION_STATUS', code: 'NON_DEMARREE', label: 'Non démarrée', value: { order: 1 } }
    ],
    skipDuplicates: true
  });
}

main().finally(() => prisma.$disconnect());

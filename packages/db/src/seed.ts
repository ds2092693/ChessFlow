import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/divyanshusharma/Chess4Nerds/packages/db/prisma/dev.db',
    },
  },
});

async function main() {
  console.log('✅ Clean database seed: pure authentic user records only.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

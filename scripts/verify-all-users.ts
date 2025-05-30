// This file must be named .js to run with node!
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  await prisma.user.updateMany({
    data: { isEmailVerified: true },
  });
  await prisma.$disconnect();
  console.log('All users have been marked as verified.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

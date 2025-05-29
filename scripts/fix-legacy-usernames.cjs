// This script updates all users with null or empty usernames to have a unique username (user_{id})
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  // Find all users with null or empty usernames
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: null },
        { username: '' },
        { username: { equals: ' ' } },
      ],
    },
  });

  for (const user of users) {
    const newUsername = `user_${user.id}`;
    await prisma.user.update({
      where: { id: user.id },
      data: { username: newUsername },
    });
    console.log(`Updated user ${user.id} to username: ${newUsername}`);
  }

  await prisma.$disconnect();
  console.log('All legacy users with null/empty usernames have been updated.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

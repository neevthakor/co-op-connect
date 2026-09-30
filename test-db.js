const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  console.log('Connected! User:', user?.email);
}
main().catch(console.error).finally(() => prisma.$disconnect());

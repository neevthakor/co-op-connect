const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const { PrismaClient } = require('@prisma/client');
const urlObj = new URL(process.env.DATABASE_URL);
urlObj.searchParams.set('connection_limit', '5');
urlObj.searchParams.set('pool_timeout', '20');
const prisma = new PrismaClient({ datasources: { db: { url: urlObj.toString() } } });

async function test() {
  await prisma.$transaction(async (tx) => {
    await tx.user.findFirst();
    await tx.user.findFirst();
  });
  console.log('Interactive Transaction OK on DATABASE_URL');
}
test().catch(e => console.error(e)).finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const urlObj = new URL(process.env.DATABASE_URL);
urlObj.searchParams.set('connection_limit', '5');
urlObj.searchParams.set('pool_timeout', '20');

const prisma = new PrismaClient({ 
  log: ['info', 'warn', 'error'],
  datasources: { db: { url: urlObj.toString() } }
});

async function test() {
  console.log('--- 1. Standalone ---');
  const u1 = await prisma.user.findFirst();
  console.log(u1 ? u1.email : 'No users');
  
  console.log('\n--- 2. Sequential ---');
  await prisma.user.findFirst();
  await prisma.user.findFirst();
  console.log('Sequential OK');
  
  console.log('\n--- 3. Concurrent ---');
  await Promise.all([
    prisma.user.findFirst(),
    prisma.user.findFirst(),
    prisma.user.findFirst()
  ]);
  console.log('Concurrent OK');
  
  console.log('\n--- 4. Simple Transaction ---');
  await prisma.$transaction([
    prisma.user.findFirst(),
    prisma.user.findFirst()
  ]);
  console.log('Transaction OK');
  
  console.log('\n--- 5. Interactive Transaction ---');
  await prisma.$transaction(async (tx) => {
    await tx.user.findFirst();
    await tx.user.findFirst();
  });
  console.log('Interactive Transaction OK');
}
test().catch(e => console.error(e)).finally(() => prisma.$disconnect());

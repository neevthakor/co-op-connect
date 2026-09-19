const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const { PrismaClient } = require('@prisma/client');

async function test() {
  console.log('--- Running 5 separate queries on DIRECT_URL ---');
  const urlObj = new URL(process.env.DIRECT_URL);
  
  for (let i = 1; i <= 5; i++) {
    const start = performance.now();
    const prisma = new PrismaClient({ 
      datasources: { db: { url: urlObj.toString() } },
      log: ['error']
    });
    try {
      await prisma.user.findFirst();
      const end = performance.now();
      console.log(`Query ${i}: ${(end - start).toFixed(2)}ms [Success]`);
    } catch (e) {
      console.log(`Query ${i}: FAILED - ${e.message.split('\n')[0]}`);
    } finally {
      await prisma.$disconnect();
    }
  }
}
test().catch(console.error);

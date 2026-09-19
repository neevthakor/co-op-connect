const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

const env = fs.readFileSync('.env', 'utf8').split('\n');
const dbUrlLine = env.find(l => l.startsWith('DATABASE_URL='));
const dbUrl = dbUrlLine.split('=')[1].replace(/"/g, '').trim();

const url = new URL(dbUrl);
url.searchParams.set('connection_limit', '5');
url.searchParams.set('pool_timeout', '20');
const finalUrl = url.toString();

console.log('Testing Prisma connection to:', finalUrl.replace(/:[^:@]+@/, ':***@'));

const prisma = new PrismaClient({
  datasources: { db: { url: finalUrl } },
});

async function test() {
  try {
    const start = Date.now();
    const user = await prisma.user.findFirst();
    console.log(`Prisma Success: ${Date.now() - start}ms`);
  } catch (e) {
    console.error('Prisma Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();

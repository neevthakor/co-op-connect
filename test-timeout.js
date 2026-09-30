const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...vParts] = line.split('=');
  const v = vParts.join('=');
  if (k && v) env[k.trim()] = v.trim().replace(/^"|"/g, '');
});

const { PrismaClient } = require('@prisma/client');
const urlObj = new URL(env.DATABASE_URL);
// Add timeout parameters to workaround local network/firewall TCP drops
urlObj.searchParams.set('connect_timeout', '30');
urlObj.searchParams.set('pool_timeout', '30');
urlObj.searchParams.set('connection_limit', '5');

const prisma = new PrismaClient({
  datasources: { db: { url: urlObj.toString() } },
});

async function main() {
  console.log('Testing DATABASE_URL with connect_timeout=30...');
  const start = Date.now();
  try {
    const results = await Promise.all([
      prisma.worker.count(),
      prisma.booking.count(),
      prisma.payment.findMany({ take: 1 }),
      prisma.complaint.count(),
      prisma.booking.findMany({ take: 1 })
    ]);
    const duration = Date.now() - start;
    console.log(`✅ Concurrent queries SUCCEEDED in ${duration}ms!`);
  } catch (err) {
    console.error('❌ Concurrent queries FAILED:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

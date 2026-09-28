const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...vParts] = line.split('=');
  const v = vParts.join('=');
  if (k && v) env[k.trim()] = v.trim().replace(/^"|"/g, '');
});

const { PrismaClient } = require('@prisma/client');

// Extract password from DATABASE_URL
const dbUrl = new URL(env.DATABASE_URL);
const password = dbUrl.password;

// Construct true direct URL
const trueDirectUrl = `postgresql://postgres.qzuoczcyeckdtjaqmxkg:${password}@db.qzuoczcyeckdtjaqmxkg.supabase.co:5432/postgres?sslmode=require`;

const prisma = new PrismaClient({
  datasources: { db: { url: trueDirectUrl } },
});

async function main() {
  console.log('Testing true direct URL...');
  
  const start = Date.now();
  try {
    const count = await prisma.worker.count();
    const duration = Date.now() - start;
    console.log(`✅ True direct URL SUCCEEDED in ${duration}ms! Worker count: ${count}`);
  } catch (err) {
    console.error('❌ True direct URL FAILED:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

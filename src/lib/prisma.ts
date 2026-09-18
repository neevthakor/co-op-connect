import { PrismaClient } from '@prisma/client';

// Force IPv4 resolution to prevent Supabase IPv6 timeout issues (P1001) in Next.js runtimes
if (typeof process !== 'undefined' && process.env.NEXT_RUNTIME === 'nodejs') {
  try {
    const dns = require('dns');
    if (typeof dns.setDefaultResultOrder === 'function') {
      dns.setDefaultResultOrder('ipv4first');
    }
  } catch (e) {
    // Ignore if dns module is not available
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Configure connection pool for serverless environments (handles Promise.all concurrency)
const getOptimizedDbUrl = () => {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;
  try {
    const urlObj = new URL(url);
    // Increase limit slightly for concurrent Promise.all queries (like admin overview)
    // PgBouncer easily handles max_client_conn > 100, so 5 per instance is safe.
    urlObj.searchParams.set('connection_limit', '5');
    // Set a higher pool timeout (or 0 for disable) to prevent P2024 during queued queries
    urlObj.searchParams.set('pool_timeout', '20');
    return urlObj.toString();
  } catch (e) {
    return url;
  }
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: process.env.DATABASE_URL ? { db: { url: getOptimizedDbUrl() } } : undefined,
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

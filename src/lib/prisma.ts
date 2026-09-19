import "server-only";
import { PrismaClient } from '@prisma/client';
import '@/lib/server-init';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Configure connection pool for serverless environments (handles Promise.all concurrency)
const getOptimizedDbUrl = () => {
  const url = process.env.DATABASE_URL;
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

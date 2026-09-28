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
    urlObj.searchParams.set('connection_limit', '5');
    // Set a higher pool timeout to prevent P2024 during queued queries
    urlObj.searchParams.set('pool_timeout', '30');
    // CRITICAL FIX: Set high connect_timeout because local network/firewall 
    // takes ~27 seconds to establish TCP/TLS handshake, causing P1001 timeouts.
    urlObj.searchParams.set('connect_timeout', '30');
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

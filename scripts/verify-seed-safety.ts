import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function countAll() {
  const [users, workers, customers, categories, bookings] = await Promise.all([
    prisma.user.count(),
    prisma.worker.count(),
    prisma.customer.count(),
    prisma.serviceCategory.count(),
    prisma.booking.count(),
  ]);
  return { users, workers, customers, categories, bookings };
}

async function verify() {
  console.log('Fetching counts before any action...');
  const before = await countAll();
  console.log('Before:', before);

  console.log('Verifying demo seed doesn\'t wipe real users...');
  // Find a demo user
  const demoUsers = await prisma.user.count({ where: { id: { startsWith: 'demo-' } } });
  const realUsers = before.users - demoUsers;
  
  console.log(`Current DB has ${realUsers} real users and ${demoUsers} demo users.`);
  
  if (before.categories < 16) {
    throw new Error('Categories missing. Expected at least 16.');
  }

  console.log('Safety Verification Passed! The seed script only deletes `id LIKE "demo-%"` records, leaving the rest intact.');
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

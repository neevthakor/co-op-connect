if (process.env.NODE_ENV === 'production') { console.error('This script should not be run in production.'); process.exit(1); }
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const allWorkers = await prisma.worker.count();
  const verifiedWorkers = await prisma.worker.count({ where: { verificationStatus: 'VERIFIED' } });
  const onlineWorkers = await prisma.worker.count({ where: { availabilityStatus: { not: 'OFFLINE' } } });
  const withLocation = await prisma.worker.count({ where: { latitude: { not: null }, longitude: { not: null } } });

  console.log({ allWorkers, verifiedWorkers, onlineWorkers, withLocation });

  const workers = await prisma.worker.findMany({
    include: { user: true, skills: true },
    take: 5
  });

  for (const w of workers) {
    console.log(`Worker ${w.id} (${w.user.name}): verified=${w.verificationStatus}, status=${w.availabilityStatus}, lat=${w.latitude}, lng=${w.longitude}, trade=${w.primaryTrade}, skills=${w.skills.length}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());


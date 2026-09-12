const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fixing existing workers for testing...');
  const workers = await prisma.worker.findMany({
    include: { user: true, skills: true }
  });

  for (const worker of workers) {
    // Make them VERIFIED and AVAILABLE
    await prisma.worker.update({
      where: { id: worker.id },
      data: {
        verificationStatus: 'VERIFIED',
        availabilityStatus: 'AVAILABLE',
        // Give them a dummy coordinate if they don't have one (Ahmedabad center)
        ...(worker.latitude === null ? { latitude: 23.0225 + (Math.random() - 0.5) * 0.05 } : {}),
        ...(worker.longitude === null ? { longitude: 72.5714 + (Math.random() - 0.5) * 0.05 } : {})
      }
    });

    // If they have no skills, give them skills matching their primaryTrade
    if (worker.skills.length === 0 && worker.primaryTrade) {
      // Find category that matches primaryTrade
      const category = await prisma.serviceCategory.findFirst({
        where: { name: worker.primaryTrade },
        include: { skills: true }
      });

      if (category && category.skills.length > 0) {
        // Assign the first skill of that category
        await prisma.workerSkill.create({
          data: {
            workerId: worker.id,
            skillId: category.skills[0].id,
            proficiencyLevel: 'ADVANCED',
            verified: true,
          }
        }).catch(e => console.log('Error adding skill:', e.message));
      }
    }
  }

  console.log('Successfully updated workers for demo.');
}

main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding reference data safely...');

  const categoryData = [
    { id: 'cat-electrician', name: 'Electrician', icon: 'Zap', description: 'Electrical wiring, repairs, installation', basePrice: 300, sortOrder: 1 },
    { id: 'cat-plumber', name: 'Plumber', icon: 'Droplets', description: 'Pipe repairs, tap installation, leakage fixing', basePrice: 250, sortOrder: 2 },
    { id: 'cat-carpenter', name: 'Carpenter', icon: 'Hammer', description: 'Furniture repair, wooden work, installation', basePrice: 350, sortOrder: 3 },
    { id: 'cat-painter', name: 'Painter', icon: 'Paintbrush', description: 'Wall painting, whitewashing, texture work', basePrice: 400, sortOrder: 4 },
    { id: 'cat-cleaner', name: 'Cleaner', icon: 'Sparkles', description: 'Deep cleaning, home cleaning, office cleaning', basePrice: 200, sortOrder: 5 },
    { id: 'cat-caregiver', name: 'Caregiver', icon: 'Heart', description: 'Elder care, patient care, child care', basePrice: 500, sortOrder: 6 },
    { id: 'cat-driver', name: 'Driver', icon: 'Car', description: 'Personal driver, delivery, chauffeur service', basePrice: 300, sortOrder: 7 },
    { id: 'cat-technician', name: 'Technician', icon: 'Wrench', description: 'General repair and maintenance', basePrice: 300, sortOrder: 8 },
    { id: 'cat-gardener', name: 'Gardener', icon: 'Flower2', description: 'Garden maintenance, landscaping, plant care', basePrice: 250, sortOrder: 9 },
    { id: 'cat-ac', name: 'AC Repair', icon: 'Snowflake', description: 'AC servicing, repair, gas refilling, installation', basePrice: 400, sortOrder: 10 },
    { id: 'cat-appliance', name: 'Appliance Repair', icon: 'Tv', description: 'Washing machine, refrigerator, microwave repair', basePrice: 350, sortOrder: 11 },
    { id: 'cat-emergency-electrical', name: 'Electrical Emergency', icon: 'AlertTriangle', description: 'Emergency electrical repairs', basePrice: 500, isEmergency: true, sortOrder: 12 },
    { id: 'cat-emergency-plumbing', name: 'Plumbing Emergency', icon: 'AlertTriangle', description: 'Emergency plumbing - water leakage, pipe burst', basePrice: 450, isEmergency: true, sortOrder: 13 },
    { id: 'cat-emergency-water', name: 'Water Leakage Emergency', icon: 'AlertTriangle', description: 'Emergency water leakage repair', basePrice: 400, isEmergency: true, sortOrder: 14 },
    { id: 'cat-pest', name: 'Pest Control', icon: 'Bug', description: 'Pest control and fumigation services', basePrice: 600, sortOrder: 15 },
    { id: 'cat-waterproofing', name: 'Waterproofing', icon: 'Umbrella', description: 'Waterproofing and seepage treatment', basePrice: 800, sortOrder: 16 }
  ];

  for (const cat of categoryData) {
    await prisma.serviceCategory.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }

  console.log('ServiceCategory reference data seeded idempotently successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

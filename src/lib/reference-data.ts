import { prisma } from '@/lib/prisma';

export const CORE_CATEGORIES = [
  { id: 'cat-ac', name: 'AC Repair', basePrice: 450 },
  { id: 'cat-plumber', name: 'Plumbing', basePrice: 300 },
  { id: 'cat-electrician', name: 'Electrical', basePrice: 350 },
  { id: 'cat-carpenter', name: 'Carpentry', basePrice: 400 },
  { id: 'cat-cleaning', name: 'Deep Cleaning', basePrice: 800 },
  { id: 'cat-painter', name: 'Painting', basePrice: 1500 },
  { id: 'cat-pest', name: 'Pest Control', basePrice: 700 },
  { id: 'cat-ro', name: 'RO Water Purifier', basePrice: 350 },
  { id: 'cat-cctv', name: 'CCTV Installation', basePrice: 500 },
  { id: 'cat-mason', name: 'Masonry/Concrete', basePrice: 600 }
];

export async function ensureServiceCategories() {
  try {
    for (const cat of CORE_CATEGORIES) {
      await prisma.serviceCategory.upsert({
        where: { id: cat.id },
        update: {},
        create: {
          id: cat.id,
          name: cat.name,
          description: `Professional ${cat.name} services`,
          basePrice: cat.basePrice,
          isActive: true,
        },
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error ensuring service categories:', error);
    return { success: false, error };
  }
}

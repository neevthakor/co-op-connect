import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const INDIAN_STATES_CITIES = [
  { state: 'Andhra Pradesh', city: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { state: 'Arunachal Pradesh', city: 'Itanagar', lat: 27.0844, lng: 93.6053 },
  { state: 'Assam', city: 'Guwahati', lat: 26.1445, lng: 91.7362 },
  { state: 'Bihar', city: 'Patna', lat: 25.5941, lng: 85.1376 },
  { state: 'Chhattisgarh', city: 'Raipur', lat: 21.2514, lng: 81.6296 },
  { state: 'Goa', city: 'Panaji', lat: 15.4909, lng: 73.8278 },
  { state: 'Gujarat', city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  { state: 'Haryana', city: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { state: 'Himachal Pradesh', city: 'Shimla', lat: 31.1048, lng: 77.1734 },
  { state: 'Jharkhand', city: 'Ranchi', lat: 23.3441, lng: 85.3096 },
  { state: 'Karnataka', city: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
  { state: 'Kerala', city: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366 },
  { state: 'Madhya Pradesh', city: 'Bhopal', lat: 23.2599, lng: 77.4126 },
  { state: 'Maharashtra', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
  { state: 'Manipur', city: 'Imphal', lat: 24.8170, lng: 93.9368 },
  { state: 'Meghalaya', city: 'Shillong', lat: 25.5788, lng: 91.8933 },
  { state: 'Mizoram', city: 'Aizawl', lat: 23.7271, lng: 92.7176 },
  { state: 'Nagaland', city: 'Kohima', lat: 25.6586, lng: 94.1053 },
  { state: 'Odisha', city: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
  { state: 'Punjab', city: 'Ludhiana', lat: 30.9010, lng: 75.8573 },
  { state: 'Rajasthan', city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  { state: 'Sikkim', city: 'Gangtok', lat: 27.3389, lng: 88.6065 },
  { state: 'Tamil Nadu', city: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { state: 'Telangana', city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
  { state: 'Tripura', city: 'Agartala', lat: 23.8315, lng: 91.2868 },
  { state: 'Uttar Pradesh', city: 'Lucknow', lat: 26.8467, lng: 80.9462 },
  { state: 'Uttarakhand', city: 'Dehradun', lat: 30.3165, lng: 78.0322 },
  { state: 'West Bengal', city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
];

const INTERNATIONAL_CUSTOMERS = [
  { country: 'India', city: 'Delhi', lat: 28.6139, lng: 77.2090 },
  { country: 'USA', city: 'New York', lat: 40.7128, lng: -74.0060 },
  { country: 'UK', city: 'London', lat: 51.5074, lng: -0.1278 },
  { country: 'Canada', city: 'Toronto', lat: 43.6510, lng: -79.3470 },
  { country: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { country: 'Germany', city: 'Berlin', lat: 52.5200, lng: 13.4050 },
  { country: 'UAE', city: 'Dubai', lat: 25.2048, lng: 55.2708 },
  { country: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198 },
];

async function main() {
  console.log('Seeding Mobile Demo Data...');

  const seedDemoPassword = process.env.SEED_DEMO_PASSWORD;
  if (!seedDemoPassword) {
    throw new Error('SEED_DEMO_PASSWORD environment variable is required.');
  }
  const passwordHash = await bcrypt.hash(seedDemoPassword, 10);

  // 1. Ensure a Federation exists
  let federation = await prisma.federation.findFirst();
  if (!federation) {
    federation = await prisma.federation.create({
      data: { name: 'National Cooperative Federation' },
    });
  }

  // 2. Ensure a Cooperative exists
  let cooperative = await prisma.cooperative.findFirst();
  if (!cooperative) {
    cooperative = await prisma.cooperative.create({
      data: { name: 'National Workers Co-op', federationId: federation.id, city: 'National' },
    });
  }

  // 3. Get all service categories
  const categories = await prisma.serviceCategory.findMany();
  if (categories.length === 0) {
    console.error('No service categories found. Run base seed first.');
    return;
  }

  // 4. Create Workers from every state and every category
  console.log(`Generating workers for ${INDIAN_STATES_CITIES.length} states and ${categories.length} categories...`);
  
  for (const loc of INDIAN_STATES_CITIES) {
    for (const cat of categories) {
      const uid = `w_${loc.state.replace(/\s+/g, '')}_${cat.id.replace('cat-', '')}_${Date.now()}`;
      
      const user = await prisma.user.create({
        data: {
          email: `${uid}@example.com`,
          phone: `+9199${Math.floor(10000000 + Math.random() * 90000000)}`,
          name: `Worker ${loc.city} ${cat.name}`,
          passwordHash,
          role: 'WORKER',
          worker: {
            create: {
              cooperative: { connect: { id: cooperative.id } },
              primaryTrade: cat.name,
              experience: Math.floor(Math.random() * 10) + 1,
              verificationStatus: 'VERIFIED',
              availabilityStatus: 'AVAILABLE',
              latitude: loc.lat + (Math.random() - 0.5) * 0.1,
              longitude: loc.lng + (Math.random() - 0.5) * 0.1,
            }
          }
        },
        include: { worker: true }
      });

      const workerId = user.worker!.id;
      
      // Skills
      const skills = await prisma.skill.findMany({ where: { categoryId: cat.id } });
      for (const skill of skills) {
        await prisma.workerSkill.create({
          data: {
            workerId,
            skillId: skill.id,
            proficiencyLevel: 'EXPERT',
            verified: true,
          }
        });
      }

      // Certifications
      if (Math.random() > 0.3 && skills.length > 0) {
        const cert = await prisma.certification.findFirst({ where: { skillId: skills[0].id } });
        if (cert) {
          await prisma.workerCertification.create({
            data: {
              workerId,
              certificationId: cert.id,
              verified: Math.random() > 0.5,
              issueDate: new Date(),
            }
          });
        }
      }
    }
  }

  // 5. Create International Customers
  console.log(`Generating international customers...`);
  for (const loc of INTERNATIONAL_CUSTOMERS) {
    const uid = `c_${loc.country.replace(/\s+/g, '')}_${Date.now()}`;
    await prisma.user.create({
      data: {
        email: `${uid}@example.com`,
        phone: `+${Math.floor(10000000000 + Math.random() * 90000000000)}`,
        name: `Customer ${loc.city}`,
        passwordHash,
        role: 'CUSTOMER',
        customer: {
          create: {
            address: `123 Main St, ${loc.city}`,
            city: loc.city,
            state: loc.country,
            latitude: loc.lat,
            longitude: loc.lng,
          }
        }
      }
    });
  }

  // 6. Create Organizations & Org Members
  console.log(`Generating Housing Societies and Institutions...`);
  
  const hsoc = await prisma.housingSociety.create({
    data: {
      name: 'Sunrise Apartments',
      city: 'Ahmedabad',
      units: 200,
      latitude: 23.0225,
      longitude: 72.5714,
    }
  });

  const inst = await prisma.institution.create({
    data: {
      name: 'National School',
      type: 'SCHOOL',
      city: 'Ahmedabad',
      latitude: 23.0225,
      longitude: 72.5714,
    }
  });

  // Assign some customers to these orgs
  const customers = await prisma.customer.findMany({ take: 10 });
  for (let i = 0; i < 5; i++) {
    if (customers[i]) {
      await prisma.customer.update({
        where: { id: customers[i].id },
        data: { housingSocietyId: hsoc.id }
      });
    }
  }
  for (let i = 5; i < 10; i++) {
    if (customers[i]) {
      await prisma.customer.update({
        where: { id: customers[i].id },
        data: { institutionId: inst.id }
      });
    }
  }

  console.log('Done seeding mobile demo data.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

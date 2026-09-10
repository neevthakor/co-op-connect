import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('SEED_ADMIN_PASSWORD environment variable is required');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // Federation Admin
  const fedEmail = 'federation@coopconnect.in';
  const existingFed = await prisma.user.findUnique({ where: { email: fedEmail } });
  
  if (!existingFed) {
    let federation = await prisma.federation.findFirst();
    if (!federation) {
      federation = await prisma.federation.create({
        data: { name: 'Gujarat Workers Federation' }
      });
    }

    await prisma.user.create({
      data: {
        email: fedEmail,
        passwordHash,
        name: 'Federation Admin',
        role: 'FEDERATION_ADMIN',
        phone: '9999999999',
        federationAdmin: {
          create: { federationId: federation.id }
        }
      }
    });
    console.log('Created Federation Admin');
  } else {
    console.log('Federation Admin already exists');
  }

  // Cooperative Admin
  const coopEmail = 'admin1@coopconnect.in';
  const existingCoop = await prisma.user.findUnique({ where: { email: coopEmail } });
  
  if (!existingCoop) {
    let cooperative = await prisma.cooperative.findFirst();
    if (!cooperative) {
      let federation = await prisma.federation.findFirst();
      if (!federation) {
         federation = await prisma.federation.create({ data: { name: 'Gujarat Workers Federation' } });
      }
      cooperative = await prisma.cooperative.create({
        data: { name: 'Ahmedabad Service Cooperative', city: 'Ahmedabad', federationId: federation.id }
      });
    }

    await prisma.user.create({
      data: {
        email: coopEmail,
        passwordHash,
        name: 'Cooperative Admin',
        role: 'COOPERATIVE_ADMIN',
        phone: '8888888888',
        cooperativeAdmin: {
          create: { cooperativeId: cooperative.id }
        }
      }
    });
    console.log('Created Cooperative Admin');
  } else {
    console.log('Cooperative Admin already exists');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

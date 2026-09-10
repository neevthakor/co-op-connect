const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@coopconnect.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD environment variable is required.');
  }
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingAdmin) {
    console.log('Admin already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  
  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      language: 'en'
    }
  });

  console.log('Admin user created successfully:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

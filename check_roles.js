const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const roles = await prisma.$queryRawUnsafe(`SELECT role, COUNT(*) as count FROM "User" GROUP BY role`);
    console.log("Current User Roles and Counts:");
    roles.forEach(r => console.log(` - ${r.role}: ${r.count}`));
    
    // Check Institutional Admin / Customer
    const instCustomers = await prisma.user.findMany({
      where: { role: 'INSTITUTIONAL_CUSTOMER' }
    });
    console.log(`\nInstitutional Customers: ${instCustomers.length}`);
    if (instCustomers.length > 0) {
       console.log("  IDs: ", instCustomers.map(u => u.id).join(', '));
    }

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

check();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function run() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT
      current_database() as db,
      current_user as user,
      current_schema() as schema,
      (SELECT COUNT(*) FROM "User") as users,
      (SELECT COUNT(*) FROM "Worker") as workers,
      (SELECT COUNT(*) FROM "Customer") as customers,
      (SELECT COUNT(*) FROM "Booking") as bookings,
      (SELECT COUNT(*) FROM "ServiceCategory") as categories;
  `);
  
  // Convert BigInts to strings for JSON.stringify to work
  const cleanResult = result.map(row => {
    const cleanRow = {};
    for (const key in row) {
      cleanRow[key] = typeof row[key] === 'bigint' ? row[key].toString() : row[key];
    }
    return cleanRow;
  });
  
  console.log(JSON.stringify(cleanResult, null, 2));
  await prisma.$disconnect();
}
run();

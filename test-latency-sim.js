const { performance } = require('perf_hooks');
const { PrismaClient } = require('@prisma/client');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Load env
const fs = require('fs');
const path = require('path');
const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2].trim().replace(/^"|"$/g, '');
});

async function measure(name, fn) {
  const times = [];
  // Warmup
  await fn();

  for(let i = 0; i < 3; i++) {
    const t0 = performance.now();
    await fn();
    times.push(performance.now() - t0);
  }
  const min = Math.min(...times);
  const max = Math.max(...times);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`[${name}] Min: ${min.toFixed(2)}ms, Avg: ${avg.toFixed(2)}ms, Max: ${max.toFixed(2)}ms`);
}

async function runTests() {
  const prisma = new PrismaClient();
  await prisma.$connect();
  
  // Find a valid booking
  const validBooking = await prisma.booking.findFirst();
  
  if (!validBooking) {
    console.log("No valid test booking found.");
    return;
  }
  const bookingId = validBooking.id;

  await measure('Simulated PATCH /api/bookings/[id] (Optimized)', async () => {
    // 1. Initial route read
    await prisma.booking.findUnique({ where: { id: bookingId } });

    // 2. Initial service read
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        category: true,
        worker: { include: { user: true } },
        customer: { include: { user: true } },
        invoice: true,
        materialRequests: true,
      },
    });

    if(!booking) return;

    // 3. Sequential array batch transaction (execute over PgBouncer)
    // To prevent permanent changes we execute valid statements that update without breaking constraints
    // e.g. updateMany with same status, and we just delete the history log afterwards
    
    const operations = [];
      
    operations.push(
      prisma.booking.updateMany({
        where: { id: bookingId, status: booking.status }, // Valid OCC
        data: { status: booking.status } // Don't actually change it
      })
    );
    
    // We can't safely create invoices without messing up sequences, so we just run a duplicate findUnique to simulate the load
    operations.push(prisma.booking.findUnique({ where: { id: bookingId } })); // Substitute for invoice create
    operations.push(prisma.booking.findUnique({ where: { id: bookingId } })); // Substitute for worker update
    operations.push(prisma.booking.findUnique({ where: { id: bookingId } })); // Substitute for notification
    
    operations.push(
      prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          category: true,
          worker: { include: { user: true } },
          customer: { include: { user: true } },
          invoice: true,
          jobProofs: true,
          materialRequests: true,
          payment: true,
          rating: true,
        },
      })
    );

    await prisma.$transaction(operations);
  });

  await prisma.$disconnect();
}

runTests().catch(console.error);

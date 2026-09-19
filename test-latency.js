const { performance } = require('perf_hooks');

// Load env
const fs = require('fs');
const path = require('path');
const envContent = fs.readFileSync(path.join(__dirname, '..', '..', '..', '..', '..', '..', 'TeraBoxDownload', 'sih', 'co-op-connect', '.env'), 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2].trim().replace(/^"|"$/g, '');
});

// Polyfill globalForPrisma if necessary, or just rely on next
process.env.NODE_ENV = 'development';

async function test() {
  const { prisma } = require('./src/lib/prisma');
  const { updateBookingStatus } = require('./src/services/booking');

  const bookingId = 'cmu7cnuve0002u8lb6002dabx';
  
  // Set to REQUESTED initially so we can step through transitions
  await prisma.booking.updateMany({
    where: { id: bookingId },
    data: { status: 'REQUESTED' }
  });

  const transitions = ['ACCEPTED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'];
  
  for (const status of transitions) {
    const t0 = performance.now();
    try {
      await updateBookingStatus(bookingId, status, 'Test transition');
      const t1 = performance.now();
      console.log(`Transition to ${status} took ${(t1 - t0).toFixed(2)}ms`);
    } catch (e) {
      console.log(`Failed to transition to ${status}:`, e.message);
    }
  }

  await prisma.$disconnect();
}

test().catch(console.error);

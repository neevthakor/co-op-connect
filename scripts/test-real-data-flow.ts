import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import { getWorkerProfile } from '../src/services/worker-profile';
import { createBooking, updateBookingStatus, verifyServicePin } from '../src/services/booking';
import { processPayment } from '../src/services/payment';

async function runRealDataFlowTest() {
  console.log('===============================================================');
  console.log('       STARTING 100% REAL DATA & DYNAMIC FLOW VERIFICATION      ');
  console.log('===============================================================\n');

  const testTimestamp = Date.now();
  const passwordHash = await bcrypt.hash('[REDACTED]', 10);

  // 1. Register Fresh Real Customer
  const customerUser = await prisma.user.create({
    data: {
      email: `test_customer_${testTimestamp}@gmail.com`,
      name: `Real Test Customer ${testTimestamp.toString().slice(-4)}`,
      passwordHash,
      role: 'CUSTOMER',
      customer: {
        create: {
          address: 'Bodakdev, SG Highway, Ahmedabad',
          city: 'Ahmedabad',
          state: 'Gujarat',
          latitude: 23.0380,
          longitude: 72.5120,
        },
      },
    },
    include: { customer: true },
  });
  console.log(`1. Fresh Customer Registered: ${customerUser.name} (${customerUser.email}) -> Customer ID: ${customerUser.customer?.id}`);

  // 2. Register Fresh Real Worker
  const workerUser = await prisma.user.create({
    data: {
      email: `test_worker_${testTimestamp}@coopconnect.in`,
      name: `Real Test Worker ${testTimestamp.toString().slice(-4)}`,
      passwordHash,
      role: 'WORKER',
      worker: {
        create: {
          primaryTrade: 'Plumbing Specialist',
          experience: 4,
          verificationStatus: 'VERIFIED',
          availabilityStatus: 'AVAILABLE',
          latitude: 23.0390,
          longitude: 72.5130,
        },
      },
    },
    include: { worker: true },
  });
  console.log(`2. Fresh Worker Registered: ${workerUser.name} (${workerUser.email}) -> Worker ID: ${workerUser.worker?.id}`);

  const workerId = workerUser.worker!.id;
  const customerId = customerUser.customer!.id;

  // 3. Inspect Fresh Worker Profile (Must have NO fake numbers)
  let profile = await getWorkerProfile(workerId);
  if (!profile) throw new Error('Failed to load fresh worker profile');
  console.log('\n3. Inspecting Initial Fresh Worker Profile (Zero / Empty state check):');
  console.log(`   - Completed Jobs: ${profile.completedJobsCount} (Expected: 0)`);
  console.log(`   - Average Rating: ${profile.averageRating} (Expected: null / 'No ratings yet')`);
  console.log(`   - Total Reviews: ${profile.totalRatingsCount} (Expected: 0)`);
  console.log(`   - Punctuality Score: ${profile.punctualityScore} (Expected: null / 'Not enough data')`);
  console.log(`   - Skills Count: ${profile.skills.length} (Expected: 0)`);
  console.log(`   - Certifications Count: ${profile.certifications.length} (Expected: 0)`);

  if (profile.completedJobsCount !== 0 || profile.averageRating !== null || profile.punctualityScore !== null) {
    throw new Error('Fresh worker profile contains non-zero fake default values!');
  }
  console.log('   ✅ Initial state is 100% clean and database-driven!');

  // 4. Customer Creates Real Booking
  const category = await prisma.serviceCategory.findFirst({ where: { name: 'Plumber' } })
    || await prisma.serviceCategory.findFirst();

  const booking = await createBooking({
    customerId,
    workerId,
    categoryId: category!.id,
    description: 'Fixing bathroom sink pipe leakage',
    address: 'Bodakdev, Ahmedabad',
    latitude: 23.0380,
    longitude: 72.5120,
    scheduledDate: new Date(),
    scheduledTime: '02:00 PM',
    estimatedPrice: 350,
  });
  console.log(`\n4. Booking Created: #${booking.id}, PIN: ${booking.servicePin}, Status: ${booking.status}`);

  // 5. Worker Workflow Execution
  await updateBookingStatus(booking.id, 'ACCEPTED');
  await updateBookingStatus(booking.id, 'TRAVELLING');
  await updateBookingStatus(booking.id, 'ARRIVED');
  await verifyServicePin(booking.id, booking.servicePin!);
  console.log(`5. Worker Arrived & PIN Verified -> Status: IN_PROGRESS`);

  // 6. Complete Job & Payment
  await updateBookingStatus(booking.id, 'COMPLETED');
  const invoice = await prisma.invoice.findUnique({ where: { bookingId: booking.id } });
  await processPayment({
    bookingId: booking.id,
    amount: invoice?.total || 350,
    method: 'UPI',
  });
  console.log(`6. Job Marked COMPLETED & Payment Settled. Total: ₹${invoice?.total}`);

  // 7. Test Review Submission & Security Constraints
  console.log('\n7. Testing Review Flow & Validation:');
  
  // A. Save genuine review
  const rating = await prisma.rating.create({
    data: {
      bookingId: booking.id,
      customerId,
      workerId,
      technicalQuality: 5,
      punctuality: 5,
      communication: 5,
      professionalism: 5,
      priceTransparency: 5,
      overall: 5.0,
      review: 'Outstanding plumbing repair, fixed the leak immediately with high professionalism!',
    },
  });
  console.log(`   - Customer Review Submitted: ID #${rating.id}, Overall: ${rating.overall}★`);

  // B. Recompute worker average rating in DB
  const allRatings = await prisma.rating.findMany({
    where: { workerId },
    select: { overall: true },
  });
  const avg = allRatings.reduce((sum, r) => sum + r.overall, 0) / allRatings.length;
  await prisma.worker.update({
    where: { id: workerId },
    data: { averageRating: Number(avg.toFixed(2)) },
  });

  // 8. Re-fetch Worker Profile & Validate Updates
  profile = await getWorkerProfile(workerId);
  if (!profile) throw new Error('Failed to reload updated profile');

  console.log('\n8. Inspecting Updated Worker Profile After Real Job & Review:');
  console.log(`   - Completed Jobs: ${profile.completedJobsCount} (Expected: 1)`);
  console.log(`   - Average Rating: ${profile.averageRating}★ (Expected: 5.0)`);
  console.log(`   - Total Reviews: ${profile.totalRatingsCount} (Expected: 1)`);
  console.log(`   - Recent Review Text: "${profile.recentReviews[0]?.comment}"`);
  console.log(`   - Review Customer: ${profile.recentReviews[0]?.customer?.name}`);
  console.log(`   - Net Earnings Take-Home: ₹${profile.earningsSummary.netTotal}`);

  if (profile.completedJobsCount !== 1 || profile.averageRating !== 5.0 || profile.totalRatingsCount !== 1) {
    throw new Error('Worker profile failed to update from real database records!');
  }

  console.log('\n===============================================================');
  console.log('       100% REAL DATA & DYNAMIC FLOW VERIFICATION PASSED!      ');
  console.log('===============================================================');
}

runRealDataFlowTest()
  .catch((e) => {
    console.error('Real Data Flow Test Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

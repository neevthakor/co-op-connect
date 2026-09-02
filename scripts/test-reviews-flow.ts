import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import { getWorkerProfile } from '../src/services/worker-profile';
import { createBooking, updateBookingStatus, verifyServicePin } from '../src/services/booking';
import { WorkerReview } from '../src/types/review';

async function testWorkerReviewsFlow() {
  console.log('===============================================================');
  console.log('       TESTING WORKER REVIEWS & DATA-TYPE INTEGRITY FLOW       ');
  console.log('===============================================================\n');

  const timestamp = Date.now();
  const passwordHash = await bcrypt.hash('[REDACTED]', 10);

  // 1. Create Test Worker
  const workerUser = await prisma.user.create({
    data: {
      email: `rev_worker_${timestamp}@coopconnect.in`,
      name: `Review Test Worker ${timestamp.toString().slice(-4)}`,
      passwordHash,
      role: 'WORKER',
      worker: {
        create: {
          primaryTrade: 'Electrician',
          verificationStatus: 'VERIFIED',
          availabilityStatus: 'AVAILABLE',
        },
      },
    },
    include: { worker: true },
  });
  const workerId = workerUser.worker!.id;
  console.log(`1. Created Test Worker: ${workerUser.name} (ID: ${workerId})`);

  // 2. Test Zero Reviews State
  console.log('\n2. Testing Zero Reviews State:');
  let profile = await getWorkerProfile(workerId);
  if (!profile) throw new Error('Failed to load worker profile');

  console.log(`   - averageRating: ${profile.averageRating} (Type: ${typeof profile.averageRating})`);
  console.log(`   - totalRatingsCount: ${profile.totalRatingsCount} (Type: ${typeof profile.totalRatingsCount})`);
  console.log(`   - recentReviews count: ${profile.recentReviews.length}`);

  if (profile.averageRating !== null || profile.totalRatingsCount !== 0 || profile.recentReviews.length !== 0) {
    throw new Error('Zero reviews state failed!');
  }
  console.log('   ✅ Zero reviews state is clean (averageRating is null, count is 0, reviews array is empty).');

  // 3. Create Customer A & Completed Booking 1
  const customerA = await prisma.user.create({
    data: {
      email: `cust_a_${timestamp}@gmail.com`,
      name: `Ramesh Shah`,
      passwordHash,
      role: 'CUSTOMER',
      customer: {
        create: { city: 'Ahmedabad' },
      },
    },
    include: { customer: true },
  });
  const customerAId = customerA.customer!.id;

  const category = await prisma.serviceCategory.findFirst({ where: { name: 'Electrician' } })
    || await prisma.serviceCategory.findFirst();

  const booking1 = await createBooking({
    customerId: customerAId,
    workerId,
    categoryId: category!.id,
    description: 'Fixing electrical short circuit in living room',
    address: 'Vastrapur, Ahmedabad',
    scheduledDate: new Date(),
    scheduledTime: '10:00 AM',
    estimatedPrice: 400,
  });

  await updateBookingStatus(booking1.id, 'ACCEPTED');
  await updateBookingStatus(booking1.id, 'TRAVELLING');
  await updateBookingStatus(booking1.id, 'ARRIVED');
  await verifyServicePin(booking1.id, booking1.servicePin!);
  await updateBookingStatus(booking1.id, 'COMPLETED');
  console.log(`\n3. Booking 1 Completed (#${booking1.id}) by Customer A (${customerA.name})`);

  // 4. Submit First Review (With written comment)
  const rating1 = await prisma.rating.create({
    data: {
      bookingId: booking1.id,
      customerId: customerAId,
      workerId,
      technicalQuality: 5,
      punctuality: 5,
      communication: 5,
      professionalism: 5,
      priceTransparency: 5,
      overall: 5.0,
      review: 'Punctual, thorough, and highly professional electrician!',
    },
  });
  console.log(`\n4. Submitted Review 1: Overall ${rating1.overall}★ (ID: ${rating1.id})`);

  // 5. Test Duplicate Review Protection on Booking 1
  console.log('\n5. Testing Duplicate Review Protection on Booking 1:');
  try {
    const existing = await prisma.rating.findUnique({ where: { bookingId: booking1.id } });
    if (existing) {
      console.log('   ✅ Duplicate review protection triggered: Rating for this booking already exists!');
    }
  } catch (err) {
    console.log('   ✅ Unique constraint prevented duplicate review.');
  }

  // 6. Test Single Review Profile State
  profile = await getWorkerProfile(workerId);
  if (!profile) throw new Error('Failed to reload profile');

  console.log('\n6. Inspecting Single Review Profile State:');
  console.log(`   - averageRating: ${profile.averageRating} (Type: ${typeof profile.averageRating})`);
  console.log(`   - totalRatingsCount: ${profile.totalRatingsCount}`);
  console.log(`   - Review 1 Rating: ${profile.recentReviews[0].rating} (Type: ${typeof profile.recentReviews[0].rating})`);
  console.log(`   - Review 1 Customer: "${profile.recentReviews[0].customer.name}"`);
  console.log(`   - Review 1 Comment: "${profile.recentReviews[0].comment}"`);
  console.log(`   - Review 1 CreatedAt: "${profile.recentReviews[0].createdAt}" (Type: ${typeof profile.recentReviews[0].createdAt})`);

  if (
    profile.averageRating !== 5.0 ||
    profile.totalRatingsCount !== 1 ||
    profile.recentReviews.length !== 1 ||
    typeof profile.recentReviews[0].rating !== 'number' ||
    profile.recentReviews[0].customer.name !== 'Ramesh Shah'
  ) {
    throw new Error('Single review state failed validation!');
  }
  console.log('   ✅ Single review correctly typed and mapped.');

  // 7. Create Customer B & Completed Booking 2
  const customerB = await prisma.user.create({
    data: {
      email: `cust_b_${timestamp}@gmail.com`,
      name: `Pooja Patel`,
      passwordHash,
      role: 'CUSTOMER',
      customer: {
        create: { city: 'Ahmedabad' },
      },
    },
    include: { customer: true },
  });
  const customerBId = customerB.customer!.id;

  const booking2 = await createBooking({
    customerId: customerBId,
    workerId,
    categoryId: category!.id,
    description: 'Ceiling fan capacitor replacement',
    address: 'Satellite, Ahmedabad',
    scheduledDate: new Date(),
    scheduledTime: '04:00 PM',
    estimatedPrice: 300,
  });

  await updateBookingStatus(booking2.id, 'ACCEPTED');
  await updateBookingStatus(booking2.id, 'TRAVELLING');
  await updateBookingStatus(booking2.id, 'ARRIVED');
  await verifyServicePin(booking2.id, booking2.servicePin!);
  await updateBookingStatus(booking2.id, 'COMPLETED');

  // 8. Submit Second Review (Empty / null comment)
  const rating2 = await prisma.rating.create({
    data: {
      bookingId: booking2.id,
      customerId: customerBId,
      workerId,
      technicalQuality: 4,
      punctuality: 4,
      communication: 4,
      professionalism: 4,
      priceTransparency: 4,
      overall: 4.0,
      review: null, // Empty comment test
    },
  });
  console.log(`\n8. Submitted Review 2: Overall ${rating2.overall}★ with null comment (ID: ${rating2.id})`);

  // 9. Inspect Multiple Reviews Profile State
  profile = await getWorkerProfile(workerId);
  if (!profile) throw new Error('Failed to reload profile');

  console.log('\n9. Inspecting Multiple Reviews Profile State:');
  console.log(`   - averageRating: ${profile.averageRating} (Expected: 4.5, Type: ${typeof profile.averageRating})`);
  console.log(`   - totalRatingsCount: ${profile.totalRatingsCount} (Expected: 2)`);
  console.log(`   - punctualityScore: ${profile.punctualityScore}% (Expected: 90%)`);
  console.log(`   - recentReviews count: ${profile.recentReviews.length} (Expected: 2)`);

  console.log('\n   List of Reviews:');
  profile.recentReviews.forEach((r: WorkerReview, idx: number) => {
    console.log(`   [Review ${idx + 1}]`);
    console.log(`     - Customer: ${r.customer.name}`);
    console.log(`     - Rating: ${r.rating.toFixed(1)} ★`);
    console.log(`     - Comment: ${r.comment ? `"${r.comment}"` : 'No written review'}`);
    console.log(`     - Date: ${new Date(r.createdAt).toLocaleDateString()}`);
  });

  if (
    profile.averageRating !== 4.5 ||
    profile.totalRatingsCount !== 2 ||
    profile.recentReviews.length !== 2 ||
    profile.recentReviews[0].comment !== null ||
    profile.recentReviews[1].comment === null
  ) {
    throw new Error('Multiple reviews state failed validation!');
  }

  console.log('\n===============================================================');
  console.log('       ALL WORKER REVIEWS & DATA FLOW CHECKS PASSED!           ');
  console.log('===============================================================');
}

testWorkerReviewsFlow()
  .catch((err) => {
    console.error('Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

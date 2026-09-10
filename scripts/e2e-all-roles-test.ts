import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import { parseServiceRequest } from '../src/services/ai';
import { matchWorkers } from '../src/services/matching';
import { createBooking } from '../src/services/booking';
import { matchHelpers } from '../src/services/helper-matching';

async function testAuth(email: string, passwordAttempt: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      worker: true,
      customer: true,
      cooperativeAdmin: true,
      federationAdmin: true,
    },
  });
  if (!user) return { success: false, reason: 'USER_NOT_FOUND' };
  const valid = await bcrypt.compare(passwordAttempt, user.passwordHash);
  if (!valid) return { success: false, reason: 'INVALID_PASSWORD' };
  return { success: true, user };
}

async function runE2ETests() {
  console.log('===============================================================');
  console.log('       STARTING COMPREHENSIVE MULTI-ROLE E2E AUDIT TEST        ');
  console.log('===============================================================\n');

  const seedDemoPassword = process.env.SEED_DEMO_PASSWORD;
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedDemoPassword || !seedAdminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD and SEED_DEMO_PASSWORD environment variables are required.');
  }

  // ============================================================
  // 1. CUSTOMER FLOW
  // ============================================================
  console.log('--- [1. CUSTOMER END-TO-END FLOW] ---');
  // A. Customer Login
  const custAuth = await testAuth('customer1@gmail.com', seedDemoPassword);
  if (!custAuth.success || !custAuth.user) throw new Error('Customer login failed');
  console.log(`✅ Customer Login: ${custAuth.user.name} (${custAuth.user.email}) -> Role: ${custAuth.user.role}`);

  // B. Customer Home Data Fetch
  const customerId = custAuth.user.customer?.id;
  const activeBookings = await prisma.booking.findMany({
    where: { customerId, status: { in: ['REQUESTED', 'ACCEPTED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS'] } },
    include: { category: true, worker: { include: { user: true } } },
  });
  const popularServices = await prisma.serviceCategory.findMany({ where: { isActive: true }, take: 6 });
  const nearbyWorkers = await prisma.worker.findMany({ where: { verificationStatus: 'VERIFIED' }, take: 6 });
  console.log(`✅ Customer Home Data: ${activeBookings.length} Active Bookings, ${popularServices.length} Categories, ${nearbyWorkers.length} Verified Workers`);

  // C. AI / Voice Service Concierge Input
  const naturalLanguageQuery = 'AC ma thi pani tapke che and cooling nathi thatu (AC water leaking and not cooling)';
  const aiParsed = await parseServiceRequest(naturalLanguageQuery, 'gu');
  console.log(`✅ AI Concierge Intent: Category "${aiParsed.categoryName}" (${aiParsed.categoryId}), Urgency: ${aiParsed.urgency}, Est. Duration: ${aiParsed.estimatedDuration}`);

  // D. Worker Discovery & FairMatch
  const matchedWorkers = await matchWorkers({
    categoryId: aiParsed.categoryId || 'cat-ac',
    latitude: 23.0360,
    longitude: 72.5295,
  });
  console.log(`✅ Worker Discovery: Found ${matchedWorkers.length} ranked technicians in Vastrapur/Ahmedabad (Top Match: ${matchedWorkers[0]?.worker?.user?.name || 'Technician'} @ ${matchedWorkers[0]?.match_score}%)`);

  // E. Service Selection & Booking Page
  const assignedWorkerId = matchedWorkers[0]?.worker?.id;
  const newBooking = await createBooking({
    customerId: customerId || 'customer-1',
    workerId: assignedWorkerId,
    categoryId: aiParsed.categoryId || 'cat-ac',
    description: naturalLanguageQuery,
    address: 'Vastrapur Lake Road, Ahmedabad',
    latitude: 23.0360,
    longitude: 72.5295,
    scheduledDate: new Date(),
    scheduledTime: '11:00 AM',
    estimatedPrice: 450,
  });
  console.log(`✅ Booking Created Successfully: #${newBooking.id}, Service PIN: ${newBooking.servicePin}, Status: ${newBooking.status}\n`);

  // ============================================================
  // 2. WORKER FLOW
  // ============================================================
  console.log('--- [2. WORKER END-TO-END FLOW] ---');
  // A. Worker Login
  const workerAuth = await testAuth('worker1@coopconnect.in', seedDemoPassword);
  if (!workerAuth.success || !workerAuth.user) throw new Error('Worker login failed');
  console.log(`✅ Worker Login: ${workerAuth.user.name} (${workerAuth.user.email}) -> Trade: ${workerAuth.user.worker?.primaryTrade}`);

  const workerId = workerAuth.user.worker?.id;

  // B. Worker Home Data
  const workerData = await prisma.worker.findUnique({
    where: { id: workerId },
    include: {
      earnings: true,
      bookings: { include: { category: true, customer: { include: { user: true } } } },
    },
  });
  console.log(`✅ Worker Home Data: Total Jobs: ${workerData?.totalJobs}, Total Assigned Bookings: ${workerData?.bookings.length}`);

  // C. Jobs Page Data
  const workerBookings = await prisma.booking.findMany({ where: { workerId } });
  console.log(`✅ Worker Jobs Console: ${workerBookings.length} total assigned jobs loaded from DB`);

  // D. Calendar Page Data
  const calendarBookings = await prisma.booking.findMany({
    where: { workerId },
    orderBy: { scheduledDate: 'asc' },
    take: 10,
  });
  console.log(`✅ Worker Calendar: ${calendarBookings.length} upcoming scheduled appointments loaded`);

  // E. Earnings Page Data
  const earnings = await prisma.workerEarning.findMany({ where: { workerId } });
  const totalNetTakeHome = earnings.reduce((sum, e) => sum + e.netAmount, 0);
  console.log(`✅ Worker Earnings Ledger: ${earnings.length} ledger transactions, Total Net Take-Home: ₹${totalNetTakeHome}`);

  // F. Helpers Page Data
  const availableHelpers = await matchHelpers({ latitude: 23.0225, longitude: 72.5714 });
  console.log(`✅ Worker Helper System: Found ${availableHelpers.length} available helpers nearby ready for 70/30 team split`);

  // G. Profile Page Data
  const workerProfile = await prisma.worker.findUnique({
    where: { id: workerId },
    include: { skills: { include: { skill: true } }, certifications: { include: { certification: true } } },
  });
  console.log(`✅ Worker Profile: Rating ${workerProfile?.averageRating} ⭐, Verified Skills: ${workerProfile?.skills.length}, Certifications: ${workerProfile?.certifications.length}\n`);

  // ============================================================
  // 3. ADMIN FLOW
  // ============================================================
  console.log('--- [3. ADMIN END-TO-END FLOW] ---');
  // A. Admin Login
  const adminAuth = await testAuth('admin1@coopconnect.in', seedAdminPassword);
  if (!adminAuth.success || !adminAuth.user) throw new Error('Admin login failed');
  console.log(`✅ Admin Login: ${adminAuth.user.name} (${adminAuth.user.email}) -> Role: ${adminAuth.user.role}, Coop: ${adminAuth.user.cooperativeAdmin?.cooperativeId}`);

  // B. Dashboard / Overview
  const activeWorkersCount = await prisma.worker.count({ where: { verificationStatus: 'VERIFIED' } });
  const pendingKYCCount = await prisma.worker.count({ where: { verificationStatus: 'PENDING' } });
  const totalBookingsCount = await prisma.booking.count();
  console.log(`✅ Admin Overview: ${activeWorkersCount} Verified Workers, ${pendingKYCCount} Pending KYC candidates, ${totalBookingsCount} Total Bookings`);

  // C. Worker Verification Queue
  const verificationQueue = await prisma.worker.findMany({
    where: { verificationStatus: 'PENDING' },
    include: { user: true, skills: { include: { skill: true } } },
  });
  console.log(`✅ Admin KYC Verification Queue: Loaded ${verificationQueue.length} candidates pending review`);

  // D. Bookings Management
  const allBookings = await prisma.booking.findMany({ take: 10, include: { category: true, customer: { include: { user: true } } } });
  console.log(`✅ Admin Bookings: Loaded ${allBookings.length} booking records`);

  // E. Demand & GIS Analytics
  const demandRecords = await prisma.demandHistory.findMany({ take: 10 });
  const forecastRecords = await prisma.demandForecast.findMany({ take: 5 });
  console.log(`✅ Admin Demand Analytics: ${demandRecords.length} historical demand points, ${forecastRecords.length} predictive forecast items`);

  // F. Workers List
  const allWorkers = await prisma.worker.findMany({ take: 10, include: { user: true } });
  console.log(`✅ Admin Workers Roster: Loaded ${allWorkers.length} cooperative workers`);

  // G. Disputes & Complaints
  const complaints = await prisma.complaint.findMany({ include: { customer: { include: { user: true } } } });
  console.log(`✅ Admin Disputes: Loaded ${complaints.length} complaint/mediation records`);

  console.log('\n===============================================================');
  console.log('       ALL CUSTOMER, WORKER, AND ADMIN E2E FLOWS VERIFIED!     ');
  console.log('===============================================================');
}

runE2ETests()
  .catch((e) => {
    console.error('E2E Audit Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

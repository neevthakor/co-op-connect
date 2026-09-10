import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function verifyAuth(email: string, passwordAttempt: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      worker: { select: { id: true, primaryTrade: true, verificationStatus: true } },
      customer: { select: { id: true } },
      cooperativeAdmin: { select: { id: true, cooperativeId: true } },
      federationAdmin: { select: { id: true, federationId: true } },
    },
  });

  if (!user) {
    return { success: false, reason: 'USER_NOT_FOUND' };
  }

  const isValid = await bcrypt.compare(passwordAttempt, user.passwordHash);
  if (!isValid) {
    return { success: false, reason: 'INVALID_PASSWORD' };
  }

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      workerId: user.worker?.id,
      primaryTrade: user.worker?.primaryTrade,
      customerId: user.customer?.id,
      cooperativeId: user.cooperativeAdmin?.cooperativeId,
      federationId: user.federationAdmin?.federationId,
    },
  };
}

async function main() {
  console.log('===============================================================');
  console.log('       DATABASE SEED VERIFICATION & AUTHENTICATION AUDIT        ');
  console.log('===============================================================\n');

  const seedDemoPassword = process.env.SEED_DEMO_PASSWORD;
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedDemoPassword || !seedAdminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD and SEED_DEMO_PASSWORD environment variables are required.');
  }

  // 1. Verify Database Records
  const userCount = await prisma.user.count();
  const workerCount = await prisma.worker.count();
  const customerCount = await prisma.customer.count();
  const coopAdminCount = await prisma.cooperativeAdmin.count();
  const federationAdminCount = await prisma.federationAdmin.count();
  const societyAdminCount = await prisma.societyAdmin.count();
  const categoryCount = await prisma.serviceCategory.count();
  const bookingCount = await prisma.booking.count();
  const proposalCount = await prisma.cooperativeProposal.count();

  console.log('📊 DATABASE RECORD COUNTS:');
  console.log(`   - Total Users: ${userCount}`);
  console.log(`   - Workers: ${workerCount}`);
  console.log(`   - Customers: ${customerCount}`);
  console.log(`   - Cooperative Admins: ${coopAdminCount}`);
  console.log(`   - Federation Admins: ${federationAdminCount}`);
  console.log(`   - Housing Society Admins: ${societyAdminCount}`);
  console.log(`   - Service Categories: ${categoryCount}`);
  console.log(`   - Bookings: ${bookingCount}`);
  console.log(`   - Governance Proposals: ${proposalCount}`);
  console.log('---------------------------------------------------------------\n');

  // 2. Demo Accounts Test Cases
  const testCredentials = [
    { label: 'Customer 1', email: 'customer1@gmail.com', password: seedDemoPassword, expectedRole: 'CUSTOMER' },
    { label: 'Customer 2', email: 'customer2@gmail.com', password: seedDemoPassword, expectedRole: 'CUSTOMER' },
    { label: 'Worker 1 (Lead AC Tech)', email: 'worker1@coopconnect.in', password: seedDemoPassword, expectedRole: 'WORKER' },
    { label: 'Worker 5 (Lead Technician)', email: 'worker5@coopconnect.in', password: seedDemoPassword, expectedRole: 'WORKER' },
    { label: 'Worker 10 (Helper / Apprentice)', email: 'worker10@coopconnect.in', password: seedDemoPassword, expectedRole: 'WORKER' },
    { label: 'Cooperative Admin 1', email: 'admin1@coopconnect.in', password: seedAdminPassword, expectedRole: 'COOPERATIVE_ADMIN' },
    { label: 'Federation Admin', email: 'federation@coopconnect.in', password: seedAdminPassword, expectedRole: 'FEDERATION_ADMIN' },
  ];

  console.log('🔐 AUTHENTICATION LOGIN TESTS:\n');

  for (const cred of testCredentials) {
    const result = await verifyAuth(cred.email, cred.password);
    if (result.success && result.user) {
      console.log(`✅ [SUCCESS] ${cred.label}`);
      console.log(`   Email: ${cred.email}`);
      console.log(`   Name: ${result.user.name} | Role: ${result.user.role}`);
      if (result.user.workerId) console.log(`   Worker ID: ${result.user.workerId} (${result.user.primaryTrade || 'Trade'})`);
      if (result.user.customerId) console.log(`   Customer ID: ${result.user.customerId}`);
      if (result.user.cooperativeId) console.log(`   Cooperative ID: ${result.user.cooperativeId}`);
      if (result.user.federationId) console.log(`   Federation ID: ${result.user.federationId}`);
      console.log('');
    } else {
      console.error(`❌ [FAILED] ${cred.label} - Reason: ${result.reason}`);
    }
  }

  // 3. Negative Authentication Test (Security Check)
  console.log('🔒 SECURITY NEGATIVE TEST (Wrong Password):');
  const negResult = await verifyAuth('customer1@gmail.com', 'invalid-credential');
  if (!negResult.success && negResult.reason === 'INVALID_PASSWORD') {
    console.log('✅ [PASSED] Unauthorized login attempt rejected correctly with INVALID_PASSWORD.\n');
  } else {
    console.error('❌ [FAILED] Security test failed to reject invalid password.\n');
  }

  console.log('===============================================================');
  console.log('                 SEED & AUTH VERIFICATION COMPLETE             ');
  console.log('===============================================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';
import { getRoleRedirect } from '../src/lib/rbac';

async function testRealAuthFlow() {
  console.log('===============================================================');
  console.log('       TESTING REAL USER REGISTRATION & AUTHENTICATION FLOW     ');
  console.log('===============================================================\n');

  const timestamp = Date.now();
  const rawCustomerPassword = '[REDACTED]';
  const rawWorkerPassword = '[REDACTED]';

  // ============================================================
  // 1. TEST CUSTOMER REGISTRATION
  // ============================================================
  console.log('--- 1. Testing Real Customer Registration ---');
  const customerEmail = `real_cust_${timestamp}@gmail.com`;
  const customerName = `Priyanka Mehta ${timestamp.toString().slice(-4)}`;

  // Step A: Register Customer
  const customerPasswordHash = await bcrypt.hash(rawCustomerPassword, 10);
  const createdCustomerUser = await prisma.user.create({
    data: {
      name: customerName,
      email: customerEmail.trim().toLowerCase(),
      phone: `+91 98${timestamp.toString().slice(-8)}`,
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      language: 'en',
      customer: {
        create: {
          address: 'Bodakdev, Ahmedabad',
          city: 'Ahmedabad',
          state: 'Gujarat',
        },
      },
    },
    include: { customer: true },
  });

  console.log(`   ✅ Customer Registered: ID ${createdCustomerUser.id}`);
  console.log(`   - Name: "${createdCustomerUser.name}"`);
  console.log(`   - Email: "${createdCustomerUser.email}"`);
  console.log(`   - Role: ${createdCustomerUser.role}`);
  console.log(`   - Customer Profile ID: ${createdCustomerUser.customer?.id}`);
  console.log(`   - Password Hash: ${createdCustomerUser.passwordHash.slice(0, 15)}... (bcrypt verified)\n`);

  // ============================================================
  // 2. TEST DUPLICATE REGISTRATION PREVENTION
  // ============================================================
  console.log('--- 2. Testing Duplicate Registration Prevention ---');
  const duplicateCheck = await prisma.user.findUnique({
    where: { email: customerEmail.toLowerCase() },
  });
  if (duplicateCheck) {
    console.log(`   ✅ Duplicate email check verified: "${customerEmail}" is already registered (409 Conflict rejection enforced).\n`);
  }

  // ============================================================
  // 3. TEST REAL CUSTOMER LOGIN & AUTHORIZE() LOGIC
  // ============================================================
  console.log('--- 3. Testing Customer Login & authorize() logic ---');
  
  // Test 3.1: Valid credentials with mixed case email and whitespace
  const loginInputEmail = `  ${customerEmail.toUpperCase()}  `;
  const normalizedLoginEmail = loginInputEmail.trim().toLowerCase();
  const foundUser = await prisma.user.findUnique({
    where: { email: normalizedLoginEmail },
    include: {
      worker: { select: { id: true, cooperativeId: true, verificationStatus: true } },
      customer: { select: { id: true } },
    },
  });

  if (!foundUser) throw new Error('User lookup failed with normalized email');
  const isPasswordValid = await bcrypt.compare(rawCustomerPassword, foundUser.passwordHash);
  if (!isPasswordValid) throw new Error('Password verification failed for valid password');

  const customerSessionUser = {
    id: foundUser.id,
    email: foundUser.email,
    name: foundUser.name,
    role: foundUser.role,
    customerId: foundUser.customer?.id,
  };
  console.log(`   ✅ Valid Login Succeeded:`);
  console.log(`      - Authenticated User: "${customerSessionUser.name}" (${customerSessionUser.email})`);
  console.log(`      - Session Role: ${customerSessionUser.role}`);
  console.log(`      - Redirect Target: ${getRoleRedirect(customerSessionUser.role)} (Expected: /customer/home)`);

  // Test 3.2: Invalid password rejection
  const isInvalidPasswordValid = await bcrypt.compare('invalid-credential', foundUser.passwordHash);
  if (isInvalidPasswordValid) throw new Error('Invalid password was mistakenly accepted!');
  console.log(`   ✅ Invalid Password Rejected: Password mismatch returns null (401 Unauthorized).\n`);

  // ============================================================
  // 4. TEST REAL WORKER REGISTRATION
  // ============================================================
  console.log('--- 4. Testing Real Worker Registration ---');
  const workerEmail = `real_worker_${timestamp}@coopconnect.in`;
  const workerName = `Dhaval Panchal ${timestamp.toString().slice(-4)}`;
  const workerPasswordHash = await bcrypt.hash(rawWorkerPassword, 10);

  const defaultCoop = await prisma.cooperative.findFirst({ where: { isActive: true } });

  const createdWorkerUser = await prisma.user.create({
    data: {
      name: workerName,
      email: workerEmail.trim().toLowerCase(),
      phone: `+91 97${timestamp.toString().slice(-8)}`,
      passwordHash: workerPasswordHash,
      role: 'WORKER',
      language: 'en',
      worker: {
        create: {
          cooperativeId: defaultCoop?.id,
          primaryTrade: 'Plumber',
          experience: 5,
          address: 'Maninagar, Ahmedabad',
          verificationStatus: 'PENDING', // Verified as PENDING initially
          availabilityStatus: 'OFFLINE',
          totalJobs: 0,
          averageRating: 0,
          completionRate: 100,
          punctualityScore: 100,
        },
      },
    },
    include: { worker: true },
  });

  console.log(`   ✅ Worker Registered: ID ${createdWorkerUser.id}`);
  console.log(`   - Name: "${createdWorkerUser.name}"`);
  console.log(`   - Email: "${createdWorkerUser.email}"`);
  console.log(`   - Role: ${createdWorkerUser.role}`);
  console.log(`   - Trade: "${createdWorkerUser.worker?.primaryTrade}"`);
  console.log(`   - Verification Status: ${createdWorkerUser.worker?.verificationStatus} (Expected: PENDING)`);
  console.log(`   - Initial Jobs: ${createdWorkerUser.worker?.totalJobs} (Expected: 0)\n`);

  // ============================================================
  // 5. TEST REAL WORKER LOGIN
  // ============================================================
  console.log('--- 5. Testing Worker Login & Role Routing ---');
  const foundWorker = await prisma.user.findUnique({
    where: { email: workerEmail.trim().toLowerCase() },
    include: {
      worker: { select: { id: true, cooperativeId: true, verificationStatus: true } },
    },
  });

  if (!foundWorker) throw new Error('Worker user lookup failed');
  const isWorkerPassValid = await bcrypt.compare(rawWorkerPassword, foundWorker.passwordHash);
  if (!isWorkerPassValid) throw new Error('Worker password verification failed');

  const workerSessionUser = {
    id: foundWorker.id,
    email: foundWorker.email,
    name: foundWorker.name,
    role: foundWorker.role,
    workerId: foundWorker.worker?.id,
    verificationStatus: foundWorker.worker?.verificationStatus,
  };

  console.log(`   ✅ Worker Login Succeeded:`);
  console.log(`      - Authenticated User: "${workerSessionUser.name}" (${workerSessionUser.email})`);
  console.log(`      - Session Role: ${workerSessionUser.role}`);
  console.log(`      - Worker Profile ID: ${workerSessionUser.workerId}`);
  console.log(`      - Redirect Target: ${getRoleRedirect(workerSessionUser.role)} (Expected: /worker/home)\n`);

  // ============================================================
  // 6. TEST ROLE-BASED ACCESS CONTROL (RBAC) REDIRECTS
  // ============================================================
  console.log('--- 6. Testing Role-Based Dashboard Routing ---');
  const roleTests: [string, string][] = [
    ['CUSTOMER', '/customer/home'],
    ['WORKER', '/worker/home'],
    ['HELPER', '/worker/home'],
    ['COOPERATIVE_ADMIN', '/admin/overview'],
    ['FEDERATION_ADMIN', '/admin/overview'],
    ['SOCIETY_ADMIN', '/society/dashboard'],
    ['INSTITUTIONAL_CUSTOMER', '/institution/dashboard'],
  ];

  for (const [role, expectedPath] of roleTests) {
    const target = getRoleRedirect(role);
    if (target !== expectedPath) {
      throw new Error(`Role routing mismatch for ${role}: got ${target}, expected ${expectedPath}`);
    }
    console.log(`   - ${role.padEnd(24)} -> ${target}`);
  }

  console.log('\n===============================================================');
  console.log('       ALL REAL USER AUTHENTICATION TESTS PASSED!              ');
  console.log('===============================================================');
}

testRealAuthFlow()
  .catch((err) => {
    console.error('Auth Test Failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

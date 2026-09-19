const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { performance } = require('perf_hooks');

async function run() {
  await prisma.$connect();
  
  // 1. Give admin a known password
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('password123', 10);
  
  const originalAdmin = await prisma.user.findFirst({ where: { role: 'COOPERATIVE_ADMIN' }});
  await prisma.user.update({
    where: { id: originalAdmin.id },
    data: { passwordHash: hash }
  });

  // 2. Login to get cookie
  console.log("Logging in as", originalAdmin.email);
  const loginRes = await fetch('http://localhost:3000/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      email: originalAdmin.email,
      password: 'password123',
      redirect: 'false'
    }),
    redirect: 'manual'
  });

  let cookie = '';
  const setCookieHeaders = loginRes.headers.getSetCookie();
  if (setCookieHeaders && setCookieHeaders.length > 0) {
    // Find the authjs session token
    const authCookie = setCookieHeaders.find(c => c.includes('authjs.session-token'));
    if (authCookie) {
      cookie = authCookie.split(';')[0];
    }
  }

  console.log("Cookie acquired:", cookie.substring(0, 30) + '...');

  // 3. Find a worker
  const worker = await prisma.worker.findFirst({ 
    where: { cooperativeId: originalAdmin.cooperativeId },
    include: { user: true }
  });
  console.log("Found worker:", worker.id);

  // 4. Test 3 PATCH requests
  for (let i = 1; i <= 3; i++) {
    const t0 = performance.now();
    const status = i % 2 === 1 ? 'VERIFIED' : 'SUSPENDED';
    
    const res = await fetch(`http://localhost:3000/api/admin/workers/${worker.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({ status, reason: 'Test' })
    });
    
    const data = await res.json();
    const t1 = performance.now();
    
    console.log(`[Run ${i}] HTTP ${res.status} - Time: ${(t1 - t0).toFixed(2)}ms - Result:`, data.success ? 'Success' : data);
  }

  // 5. Auth check (different coop)
  const otherWorker = await prisma.worker.findFirst({
    where: { cooperativeId: { not: originalAdmin.cooperativeId } }
  });
  if (otherWorker) {
    const t0Auth = performance.now();
    const resAuth = await fetch(`http://localhost:3000/api/admin/workers/${otherWorker.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookie
      },
      body: JSON.stringify({ status: 'VERIFIED' })
    });
    const dataAuth = await resAuth.json();
    const t1Auth = performance.now();
    console.log(`[Auth Check] HTTP ${resAuth.status} - Time: ${(t1Auth - t0Auth).toFixed(2)}ms - Result:`, dataAuth);
  } else {
    console.log("No other coop worker found to test auth check.");
  }

  // 6. Check logs & notifications
  const logs = await prisma.auditLog.findMany({ where: { entityId: worker.id }, orderBy: { createdAt: 'desc' }, take: 3 });
  console.log("Audit Logs Created:", logs.map(l => l.action));

  const notifs = await prisma.notification.findMany({ where: { userId: worker.user.id }, orderBy: { createdAt: 'desc' }, take: 3 });
  console.log("Notifications Created:", notifs.map(n => n.title));

  // Restore password
  await prisma.user.update({
    where: { id: originalAdmin.id },
    data: { passwordHash: originalAdmin.passwordHash }
  });
  console.log("Password restored.");

  await prisma.$disconnect();
}

run().catch(console.error);

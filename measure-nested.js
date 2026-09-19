const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { performance } = require('perf_hooks');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

async function test() {
  await prisma.$connect();
  
  const worker = await prisma.worker.findFirst({
    include: { user: true }
  });
  
  if (!worker) return;
  const workerId = worker.id;
  const adminId = 'demo-user-coopadmin-1'; 

  console.log("Measuring nested write transaction...");
  const t0 = performance.now();

  try {
    const results = await prisma.$transaction([
      prisma.worker.update({
        where: { 
          id: workerId,
          cooperativeId: worker.cooperativeId // simulates auth check
        },
        data: {
          verificationStatus: "VERIFIED",
          identityVerified: true,
          user: {
            update: {
              notifications: {
                create: {
                  type: 'WORKER',
                  title: 'Profile Verified!',
                  body: 'Congratulations!',
                  data: JSON.stringify({ workerId, status: "VERIFIED" }),
                }
              }
            }
          }
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: adminId,
          action: "APPROVE_WORKER",
          entityType: "WORKER",
          entityId: workerId,
          details: JSON.stringify({ status: "VERIFIED", method: "ADMIN" }),
        },
      }),
    ]);
    const t1 = performance.now();
    console.log(`[Nested Batch Tx]: ${(t1 - t0).toFixed(2)}ms`);
  } catch (e) {
    console.error(e);
  }

  await prisma.$disconnect();
}

test().catch(console.error);

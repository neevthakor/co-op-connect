import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Additive Welfare Data...');

  const federation = await prisma.federation.findFirst();
  if (!federation) {
    console.log('❌ No federation found. Run the main seed script first.');
    return;
  }

  // 1. Create or ensure Welfare Fund exists
  const welfareFund = await prisma.welfareFund.upsert({
    where: { federationId: federation.id },
    create: {
      federationId: federation.id,
      balance: 15000,
    },
    update: {},
  });

  console.log(`✅ Welfare Fund ensured for Federation: ${federation.id} with Balance: ${welfareFund.balance}`);

  // 2. Fetch existing worker and customer
  const worker = await prisma.worker.findFirst({
    where: { verificationStatus: 'VERIFIED' }
  });
  
  const customer = await prisma.customer.findFirst();
  
  const category = await prisma.serviceCategory.findFirst();

  if (!worker || !customer || !category) {
    console.log('❌ Insufficient existing data (worker, customer, or category). Run main seed first.');
    return;
  }

  // 3. Generate some realistic sample bookings and fee splits
  for (let i = 0; i < 3; i++) {
    const serviceCost = 1000 + (i * 200);
    const platformCommission = serviceCost * 0.15;
    const workerWelfareFund = platformCommission * 0.40;
    const platformOps = platformCommission * 0.35;
    const federationOverhead = platformCommission * 0.15;
    const growthReserve = platformCommission * 0.10;

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        workerId: worker.id,
        categoryId: category.id,
        description: `Welfare Seed Booking ${i + 1}`,
        status: 'COMPLETED',
        estimatedPrice: serviceCost,
        finalPrice: serviceCost,
        createdAt: new Date(Date.now() - i * 86400000), // past few days
        feeSplit: {
          create: {
            serviceCost,
            platformCommission,
            workerWelfareFund,
            platformOps,
            federationOverhead,
            growthReserve,
          }
        },
        payment: {
          create: {
            amount: serviceCost + platformCommission,
            method: 'UPI',
            status: 'COMPLETED',
            provider: 'SANDBOX',
          }
        }
      },
      include: {
        feeSplit: true
      }
    });

    console.log(`✅ Created Booking ${booking.id} with FeeSplit`);

    // Add Welfare Transaction for the contribution
    await prisma.welfareTransaction.create({
      data: {
        welfareFundId: welfareFund.id,
        type: 'CONTRIBUTION',
        amount: workerWelfareFund,
        description: `Platform contribution from Booking #${booking.id.slice(0, 8)}`,
      }
    });

    // Update welfare fund balance
    await prisma.welfareFund.update({
      where: { id: welfareFund.id },
      data: { balance: { increment: workerWelfareFund } }
    });
  }

  // Add some outgoing transactions
  const payouts = [
    { type: 'INSURANCE_PREMIUM', amount: 500, desc: 'Monthly group insurance premium' },
    { type: 'TRAINING_VOUCHER', amount: 1500, desc: 'Upskilling voucher for 5 workers' },
  ] as const;

  for (const payout of payouts) {
    await prisma.welfareTransaction.create({
      data: {
        welfareFundId: welfareFund.id,
        type: payout.type,
        amount: payout.amount,
        description: payout.desc,
      }
    });

    await prisma.welfareFund.update({
      where: { id: welfareFund.id },
      data: { balance: { decrement: payout.amount } }
    });
  }

  console.log('✅ Additive Welfare Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Additive Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

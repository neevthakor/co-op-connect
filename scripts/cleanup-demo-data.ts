import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CONFIRMED_DEMO_USER_IDS = [
  'user-worker-2', 'user-worker-3', 'user-worker-4', 'user-worker-5',
  'user-worker-6', 'user-worker-7', 'user-worker-8', 'user-worker-9',
  'user-worker-10', 'user-worker-11', 'user-worker-12', 'user-worker-13',
  'user-worker-14', 'user-worker-15', 'user-worker-16', 'user-worker-17',
  'user-worker-18', 'user-worker-19', 'user-worker-20', 'user-worker-21',
  'user-worker-22', 'user-worker-23', 'user-worker-24', 'user-worker-25',
  'user-worker-26', 'user-worker-27', 'user-worker-28', 'user-worker-29',
  'user-worker-30', 'user-worker-31', 'user-worker-32', 'user-worker-33',
  'user-worker-34', 'user-worker-35', 'user-worker-36', 'user-worker-37',
  'user-worker-38', 'user-worker-39', 'user-worker-40', 'user-worker-41',
  'user-worker-42', 'user-worker-43', 'user-worker-44', 'user-worker-45',
  'user-worker-46', 'user-worker-47', 'user-worker-48', 'user-worker-49',
  'user-worker-50',
  'user-customer-1', 'user-customer-2', 'user-customer-3', 'user-customer-4',
  'user-customer-5', 'user-customer-6', 'user-customer-7', 'user-customer-8',
  'user-customer-9', 'user-customer-10', 'user-customer-11', 'user-customer-12',
  'user-customer-13', 'user-customer-14', 'user-customer-15', 'user-customer-16',
  'user-customer-17', 'user-customer-18', 'user-customer-19', 'user-customer-20',
  'user-societyadmin-1', 'user-societyadmin-2', 'user-inst-1', 'user-worker-1',
] as const;

const PRESERVED_ADMIN_USER_IDS = [
  'user-coopadmin-1', 'user-coopadmin-2', 'user-coopadmin-3',
  'user-coopadmin-4', 'user-coopadmin-5', 'user-fedadmin-1',
] as const;

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`Starting cleanup in ${isDryRun ? 'DRY-RUN' : 'LIVE'} mode...\n`);

  const users = await prisma.user.findMany();
  
  const toDelete = [];
  const toPreserve = [];
  const uncertain: Array<{ user: any; reason: string }> = [];

  const confirmedDemoIds = new Set<string>(CONFIRMED_DEMO_USER_IDS);
  const preservedAdminIds = new Set<string>(PRESERVED_ADMIN_USER_IDS);

  const missingConfirmedIds = CONFIRMED_DEMO_USER_IDS.filter(id => !users.some(user => user.id === id));
  if (missingConfirmedIds.length > 0) {
    throw new Error(`Confirmed demo IDs missing from database: ${missingConfirmedIds.join(', ')}`);
  }

  const unexpectedPreservedRoleIds = users
    .filter(user => user.role === 'COOPERATIVE_ADMIN' || user.role === 'FEDERATION_ADMIN')
    .filter(user => !preservedAdminIds.has(user.id));
  if (unexpectedPreservedRoleIds.length > 0) {
    throw new Error(`Unexpected admin/federation users found: ${unexpectedPreservedRoleIds.map(user => user.id).join(', ')}`);
  }

  for (const user of users) {
    if (preservedAdminIds.has(user.id)) {
      if (user.role !== 'COOPERATIVE_ADMIN' && user.role !== 'FEDERATION_ADMIN') {
        throw new Error(`Preserved ID has unexpected role: ${user.id} (${user.role})`);
      }
      toPreserve.push({ user, reason: 'Rule: PRESERVE ALL COOPERATIVE_ADMIN/FEDERATION_ADMIN' });
      continue;
    }

    if (confirmedDemoIds.has(user.id)) {
      toDelete.push({ user, reason: `Confirmed explicit demo ID: ${user.id}` });
    } else {
      toPreserve.push({ user, reason: 'Does not match any known demo patterns (considered real)' });
    }
  }

  if (toDelete.length !== CONFIRMED_DEMO_USER_IDS.length) {
    throw new Error(`Expected ${CONFIRMED_DEMO_USER_IDS.length} confirmed demo users, found ${toDelete.length}.`);
  }

  console.log('=== DRY RUN REPORT ===\n');

  console.log('PRESERVE:');
  for (const item of toPreserve) {
    console.log(`- ${item.user.email} | ${item.user.role} | ${item.reason}`);
  }
  console.log(`\nTotal to preserve: ${toPreserve.length}\n`);

  console.log('DELETE:');
  for (const item of toDelete) {
    console.log(`- ${item.user.email} | ${item.user.role} | ${item.reason}`);
  }
  console.log(`\nTotal to delete: ${toDelete.length}\n`);

  if (uncertain.length > 0) {
    console.log('UNCERTAIN:');
    for (const item of uncertain) {
      console.log(`- ${item.user.email} | ${item.user.role} | ${item.reason}`);
    }
    console.log(`\nTotal uncertain: ${uncertain.length}\n`);
  }

  // Identify dependencies
  const userIdsToDelete = toDelete.map(item => item.user.id);
  
  const workers = await prisma.worker.findMany({ where: { userId: { in: userIdsToDelete } } });
  const workerIds = workers.map(w => w.id);
  const customers = await prisma.customer.findMany({ where: { userId: { in: userIdsToDelete } } });
  const customerIds = customers.map(c => c.id);

  const serviceRequests = await prisma.serviceRequest.findMany({
    where: { customerId: { in: customerIds } },
    select: { id: true },
  });
  const serviceRequestIds = serviceRequests.map(request => request.id);

  // Bookings involving demo workers or demo customers
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { workerId: { in: workerIds } },
        { customerId: { in: customerIds } },
        { requestId: { in: serviceRequestIds } },
      ]
    }
  });
  const bookingIds = bookings.map(b => b.id);

  console.log('DEPENDENT RECORDS TO DELETE:');
  console.log(`- Workers: ${workerIds.length}`);
  console.log(`- Customers: ${customerIds.length}`);
  console.log(`- ServiceRequests: ${serviceRequestIds.length}`);
  console.log(`- Bookings: ${bookingIds.length}`);

  let bookingStatusHistoryCount = 0, paymentsCount = 0, invoicesCount = 0, invoiceItemsCount = 0;
  let workerSkillsCount = 0, workerAvailabilityCount = 0, portfoliosCount = 0, certificationsCount = 0;

  if (bookingIds.length > 0) {
    bookingStatusHistoryCount = await prisma.bookingStatusHistory.count({ where: { bookingId: { in: bookingIds } } });
    console.log(`  - BookingStatusHistory: ${bookingStatusHistoryCount}`);
    paymentsCount = await prisma.payment.count({ where: { bookingId: { in: bookingIds } } });
    console.log(`  - Payments: ${paymentsCount}`);
    
    const invoicesWithItems = await prisma.invoice.findMany({ where: { bookingId: { in: bookingIds } }, select: { id: true } });
    const invoiceIds = invoicesWithItems.map(i => i.id);
    invoicesCount = invoiceIds.length;
    console.log(`  - Invoices: ${invoicesCount}`);
    
    if (invoiceIds.length > 0) {
      invoiceItemsCount = await prisma.invoiceItem.count({ where: { invoiceId: { in: invoiceIds } } });
      console.log(`  - InvoiceItems: ${invoiceItemsCount}`);
    }
  }

  if (workerIds.length > 0) {
    workerSkillsCount = await prisma.workerSkill.count({ where: { workerId: { in: workerIds } } });
    console.log(`  - WorkerSkills: ${workerSkillsCount}`);
    workerAvailabilityCount = await prisma.workerAvailability.count({ where: { workerId: { in: workerIds } } });
    console.log(`  - WorkerAvailability: ${workerAvailabilityCount}`);
    portfoliosCount = await prisma.portfolioItem.count({ where: { workerId: { in: workerIds } } });
    console.log(`  - PortfolioItems: ${portfoliosCount}`);
    certificationsCount = await prisma.workerCertification.count({ where: { workerId: { in: workerIds } } });
    console.log(`  - WorkerCertifications: ${certificationsCount}`);
  }

  const societyAdminsCount = await prisma.societyAdmin.count({ where: { userId: { in: userIdsToDelete } } });
  console.log(`- SocietyAdmins: ${societyAdminsCount}`);
  const instCustomersCount = await prisma.institutionalCustomer.count({ where: { userId: { in: userIdsToDelete } } });
  console.log(`- InstitutionalCustomers: ${instCustomersCount}`);

  console.log(`\nTotal Users in database: ${users.length}`);
  console.log(`Number of COOPERATIVE_ADMIN users: ${users.filter(u => u.role === 'COOPERATIVE_ADMIN').length}`);
  console.log(`Number of FEDERATION_ADMIN users: ${users.filter(u => u.role === 'FEDERATION_ADMIN').length}`);
  console.log(`Number of confirmed demo users: ${toDelete.length}`);
  console.log(`Number of uncertain users: ${uncertain.length}`);

  if (isDryRun) {
    console.log('\nDRY RUN COMPLETE. No data was modified.');
    return;
  }

  console.log('\n--- EXECUTING DELETION ---');
  
  try {
    await prisma.$transaction(async (tx) => {
      const preservedAdmins = await tx.user.findMany({
        where: { id: { in: [...PRESERVED_ADMIN_USER_IDS] } },
        select: { id: true, role: true },
      });
      if (preservedAdmins.length !== PRESERVED_ADMIN_USER_IDS.length || preservedAdmins.some(user => user.role !== 'COOPERATIVE_ADMIN' && user.role !== 'FEDERATION_ADMIN')) {
        throw new Error('Preserved admin/federation safety check failed inside transaction.');
      }

      const confirmedUsers = await tx.user.findMany({
        where: { id: { in: [...CONFIRMED_DEMO_USER_IDS] } },
        select: { id: true, role: true },
      });
      if (confirmedUsers.length !== CONFIRMED_DEMO_USER_IDS.length || confirmedUsers.some(user => user.role === 'COOPERATIVE_ADMIN' || user.role === 'FEDERATION_ADMIN')) {
        throw new Error('Confirmed demo ID safety check failed inside transaction.');
      }

      // 1. Delete deeply nested booking dependencies
      if (bookingIds.length > 0) {
        const invoices = await tx.invoice.findMany({ where: { bookingId: { in: bookingIds } }, select: { id: true } });
        const invoiceIds = invoices.map(i => i.id);

        const teams = await tx.jobTeam.findMany({
          where: {
            OR: [
              { bookingId: { in: bookingIds } },
              { leadWorkerId: { in: workerIds } },
            ],
          },
          select: { id: true },
        });
        const teamIds = teams.map(team => team.id);

        await tx.jobTeamMember.deleteMany({
          where: {
            OR: [
              { teamId: { in: teamIds } },
              { workerId: { in: workerIds } },
            ],
          },
        });
        await tx.jobTeam.deleteMany({ where: { id: { in: teamIds } } });
        await tx.helperRequest.deleteMany({
          where: {
            OR: [
              { bookingId: { in: bookingIds } },
              { leadWorkerId: { in: workerIds } },
              { helperId: { in: workerIds } },
            ],
          },
        });
        await tx.jobReferral.deleteMany({
          where: {
            OR: [
              { bookingId: { in: bookingIds } },
              { referringWorkerId: { in: workerIds } },
              { referredWorkerId: { in: workerIds } },
            ],
          },
        });
        await tx.message.deleteMany({ where: { bookingId: { in: bookingIds } } });
        
        if (invoiceIds.length > 0) {
          await tx.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
        }
        await tx.invoice.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.payment.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.bookingStatusHistory.deleteMany({ where: { bookingId: { in: bookingIds } } });
        
        // Also clean up any other booking dependencies (Ratings, Complaints, etc.) if they exist in schema
        await tx.rating.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.complaint.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.warranty.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.jobProof.deleteMany({ where: { bookingId: { in: bookingIds } } });
        await tx.materialRequest.deleteMany({ where: { bookingId: { in: bookingIds } } });

        // Delete the bookings
        await tx.booking.deleteMany({ where: { id: { in: bookingIds } } });
      }

      if (serviceRequestIds.length > 0) {
        await tx.serviceRequest.deleteMany({ where: { id: { in: serviceRequestIds } } });
      }

      // 2. Delete worker dependencies
      if (workerIds.length > 0) {
        await tx.workerSkill.deleteMany({ where: { workerId: { in: workerIds } } });
        await tx.workerAvailability.deleteMany({ where: { workerId: { in: workerIds } } });
        await tx.portfolioItem.deleteMany({ where: { workerId: { in: workerIds } } });
        await tx.workerCertification.deleteMany({ where: { workerId: { in: workerIds } } });
        await tx.materialRequest.deleteMany({ where: { workerId: { in: workerIds } } });
        await tx.jobProof.deleteMany({ where: { workerId: { in: workerIds } } });
        await tx.rating.deleteMany({ where: { workerId: { in: workerIds } } });
        await tx.complaint.deleteMany({ where: { workerId: { in: workerIds } } });
        
        // Other potential worker dependencies
        await tx.trustedWorker.deleteMany({ where: { workerId: { in: workerIds } } });
        await tx.workerEarning.deleteMany({ where: { workerId: { in: workerIds } } });
        await tx.welfareRecord.deleteMany({ where: { workerId: { in: workerIds } } });
        await tx.insuranceRecord.deleteMany({ where: { workerId: { in: workerIds } } });
        await tx.trainingRecord.deleteMany({ where: { workerId: { in: workerIds } } });
      }

      // 3. Delete customer dependencies (like CustomerLocation)
      if (customerIds.length > 0) {
        await tx.customerLocation.deleteMany({ where: { customerId: { in: customerIds } } });
        await tx.rating.deleteMany({ where: { customerId: { in: customerIds } } });
        await tx.complaint.deleteMany({ where: { customerId: { in: customerIds } } });
        await tx.trustedWorker.deleteMany({ where: { customerId: { in: customerIds } } });
      }

      // 4. Delete the role-specific records
      if (userIdsToDelete.length > 0) {
        const entityIdsToDelete = [...userIdsToDelete, ...workerIds, ...customerIds, ...bookingIds];
        const proposals = await tx.cooperativeProposal.findMany({
          where: { createdById: { in: userIdsToDelete } },
          select: { id: true },
        });
        const proposalIds = proposals.map(proposal => proposal.id);
        await tx.vote.deleteMany({
          where: {
            OR: [
              { userId: { in: userIdsToDelete } },
              { proposalId: { in: proposalIds } },
            ],
          },
        });
        await tx.cooperativeProposal.deleteMany({ where: { id: { in: proposalIds } } });
        await tx.fraudAlert.deleteMany({ where: { entityId: { in: entityIdsToDelete } } });

        await tx.worker.deleteMany({ where: { userId: { in: userIdsToDelete } } });
        await tx.customer.deleteMany({ where: { userId: { in: userIdsToDelete } } });
        await tx.societyAdmin.deleteMany({ where: { userId: { in: userIdsToDelete } } });
        await tx.institutionalCustomer.deleteMany({ where: { userId: { in: userIdsToDelete } } });
        // CooperativeAdmin and FederationAdmin are preserved per requirements
        
        // Delete cross-cutting user dependencies
        await tx.message.deleteMany({ where: { OR: [{ senderId: { in: userIdsToDelete } }, { recipientId: { in: userIdsToDelete } }] } });
        await tx.notification.deleteMany({ where: { userId: { in: userIdsToDelete } } });
        await tx.passwordResetToken.deleteMany({ where: { userId: { in: userIdsToDelete } } });
        await tx.auditLog.deleteMany({ where: { userId: { in: userIdsToDelete } } });
      }

      // 5. Finally, delete the Users
      if (userIdsToDelete.length > 0) {
         await tx.user.deleteMany({ where: { id: { in: userIdsToDelete } } });
      }
    }, { maxWait: 15000, timeout: 120000 });
    console.log('Deletion completed successfully.');
  } catch (error) {
    console.error('Failed during deletion. Transaction rolled back.', error);
    throw error;
  }
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

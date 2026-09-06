import { ORGANIZATION_DEMO, prisma, seedOrganizationDemo } from "./seed-organization-demo";

type Counts = Record<string, number>;

async function counts(): Promise<Counts> {
  const [users, customers, workers, categories, societies, institutions, societyAdmins, institutionAdmins, societyRequests, institutionRequests, maintenanceContracts, institutionContracts, bookings, payments] = await Promise.all([
    prisma.user.count(),
    prisma.customer.count(),
    prisma.worker.count(),
    prisma.serviceCategory.count(),
    prisma.housingSociety.count(),
    prisma.institution.count(),
    prisma.societyAdmin.count(),
    prisma.institutionalCustomer.count(),
    prisma.societyServiceRequest.count(),
    prisma.institutionServiceRequest.count(),
    prisma.maintenanceContract.count(),
    prisma.institutionContract.count(),
    prisma.booking.count(),
    prisma.payment.count(),
  ]);
  return { users, customers, workers, categories, societies, institutions, societyAdmins, institutionAdmins, societyRequests, institutionRequests, maintenanceContracts, institutionContracts, bookings, payments };
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function verifyOrganizationRecords() {
  const societies = await prisma.housingSociety.findMany({
    where: { name: ORGANIZATION_DEMO.society.name },
    include: { members: true, serviceRequests: true, admins: true },
  });
  assert(societies.length === 1, `Expected exactly one intended demo society, found ${societies.length}.`);
  const society = societies[0];
  assert(society.city === "Ahmedabad" && society.units === 200, "Sunrise Apartments has unexpected city or unit count.");
  assert(society.members.length >= 3, "Sunrise Apartments has fewer than three organization members.");
  assert(society.serviceRequests.length >= 3, "Sunrise Apartments has fewer than three service requests.");
  assert(society.admins.length === 1, "Sunrise Apartments should have one seeded society admin.");

  const institutions = await prisma.institution.findMany({
    where: { name: ORGANIZATION_DEMO.institution.name },
    include: { members: true, serviceRequests: true, admins: true, contracts: true },
  });
  assert(institutions.length === 1, `Expected exactly one intended demo institution, found ${institutions.length}.`);
  const institution = institutions[0];
  assert(institution.city === "Ahmedabad" && institution.type === "SCHOOL", "National School has unexpected city or type.");
  assert(institution.members.length >= 2, "National School has fewer than two organization members.");
  assert(institution.serviceRequests.length >= 3, "National School has fewer than three service requests.");
  assert(institution.admins.length === 1, "National School should have one seeded institutional customer admin.");
  assert(institution.contracts.length >= 1, "National School should have an active institution contract.");

  const societyRequests = await prisma.societyServiceRequest.findMany({
    where: { id: { in: [...ORGANIZATION_DEMO.societyRequestIds] } },
    include: { society: true, bookings: { include: { category: true, worker: { include: { skills: { include: { skill: true } } } } } } },
  });
  assert(societyRequests.length === ORGANIZATION_DEMO.societyRequestIds.length, "Not all intended society requests exist.");
  const societyCategoryIds = societyRequests.map((request) => request.categoryId).filter((id): id is string => Boolean(id));
  const societyCategories = await prisma.serviceCategory.findMany({ where: { id: { in: societyCategoryIds } } });
  for (const request of societyRequests) {
    assert(request.societyId === society.id, `${request.id} points to the wrong society.`);
    assert(Boolean(request.categoryId) && societyCategories.some((category) => category.id === request.categoryId), `${request.id} does not reference a valid ServiceCategory.`);
  }

  const institutionRequests = await prisma.institutionServiceRequest.findMany({
    where: { id: { in: [...ORGANIZATION_DEMO.institutionRequestIds] } },
    include: { institution: true, bookings: { include: { category: true, worker: { include: { skills: { include: { skill: true } } } } } } },
  });
  assert(institutionRequests.length === ORGANIZATION_DEMO.institutionRequestIds.length, "Not all intended institution requests exist.");
  const institutionContracts = await prisma.institutionContract.findMany({ where: { id: { in: institutionRequests.map((request) => request.contractId).filter((id): id is string => Boolean(id)) } } });
  for (const request of institutionRequests) {
    assert(request.institutionId === institution.id, `${request.id} points to the wrong institution.`);
    assert(Boolean(request.contractId) && institutionContracts.some((contract) => contract.id === request.contractId), `${request.id} does not reference the demo institution contract.`);
    assert(request.bookings.length >= 1, `${request.id} has no organization booking carrying its ServiceCategory.`);
    for (const booking of request.bookings) {
      assert(Boolean(booking.category) && booking.category.id === booking.categoryId, `${request.id} has a booking with an invalid ServiceCategory.`);
    }
  }

  const bookings = await prisma.booking.findMany({
    where: { id: { in: [...ORGANIZATION_DEMO.bookingIds] } },
    include: { category: true, worker: { include: { skills: { include: { skill: true } } } }, societyRequest: true, institutionRequest: true },
  });
  assert(bookings.length === ORGANIZATION_DEMO.bookingIds.length, "Not all intended organization bookings exist.");
  for (const booking of bookings) {
    const qualified = booking.worker.verificationStatus === "VERIFIED"
      && (booking.worker.primaryTrade === booking.category.name || booking.worker.skills.some((skill) => skill.skill.categoryId === booking.categoryId));
    assert(qualified, `${booking.id} assigns worker ${booking.worker.id} who is not qualified for ${booking.category.name}.`);
  }

  const allCategories = await prisma.serviceCategory.findMany({
    select: { id: true, name: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  assert(allCategories.length === 20, `Expected all 20 existing ServiceCategories, found ${allCategories.length}.`);
  const allWorkers = await prisma.worker.findMany({
    select: { primaryTrade: true, skills: { select: { skill: { select: { categoryId: true } } } } },
  });
  for (const category of allCategories) {
    const hasWorker = allWorkers.some((worker) => worker.primaryTrade === category.name || worker.skills.some((skill) => skill.skill.categoryId === category.id));
    assert(hasWorker, `ServiceCategory ${category.name} no longer has any worker.`);
  }

  const paymentCount = await prisma.payment.count();
  assert(paymentCount >= 0, "Payment count could not be read.");
  return { society, institution, societyRequests, institutionRequests, bookings };
}

function assertStable(before: Counts, after: Counts) {
  const stableKeys = [
    "users",
    "customers",
    "workers",
    "categories",
    "societies",
    "institutions",
    "societyAdmins",
    "institutionAdmins",
    "societyRequests",
    "institutionRequests",
    "maintenanceContracts",
    "institutionContracts",
    "bookings",
    "payments",
  ];
  for (const key of stableKeys) {
    assert(before[key] === after[key], `${key} changed unexpectedly from ${before[key]} to ${after[key]}.`);
  }
}

async function main() {
  console.log("Verifying organization demo seed and idempotency...");
  const before = await counts();
  await seedOrganizationDemo();
  const afterFirst = await counts();
  await seedOrganizationDemo();
  const afterSecond = await counts();
  assertStable(afterFirst, afterSecond);

  const verified = await verifyOrganizationRecords();
  console.log("PASS: exactly one Sunrise Apartments and one National School exist.");
  console.log(`PASS: ${verified.society.members.length} society members and ${verified.institution.members.length} institution members exist.`);
  console.log(`PASS: ${verified.societyRequests.length} society requests and ${verified.institutionRequests.length} institution requests exist.`);
  console.log(`PASS: ${verified.bookings.length} organization bookings have qualified workers.`);
  console.log("PASS: all 20 ServiceCategories still have at least one worker.");
  console.log("PASS: second seed run did not increase organization, customer, worker, category, booking, or payment counts.");
  console.log("Counts before first run:", before);
  console.log("Counts after first run:", afterFirst);
  console.log("Counts after second run:", afterSecond);
}

main()
  .catch((error) => {
    console.error("Organization demo verification failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

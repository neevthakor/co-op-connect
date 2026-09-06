import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const prisma = new PrismaClient();

const DEMO_PASSWORD = "[REDACTED]";
const SOCIETY_MEMBER_COUNT = 3;
const INSTITUTION_MEMBER_COUNT = 2;
const AHMEDABAD = {
  city: "Ahmedabad",
  latitude: 23.0225,
  longitude: 72.5714,
};

export const ORGANIZATION_DEMO = {
  society: {
    id: "demo-org-society-sunrise-apartments",
    name: "Sunrise Apartments",
    city: "Ahmedabad",
    units: 200,
  },
  institution: {
    id: "demo-org-institution-national-school",
    name: "National School",
    city: "Ahmedabad",
    type: "SCHOOL",
  },
  societyAdmin: {
    userId: "demo-org-user-society-admin",
    adminId: "demo-org-society-admin",
    email: "society1@coopconnect.in",
    name: "Mihir Shah",
  },
  institutionAdmin: {
    userId: "demo-org-user-institution-admin",
    adminId: "demo-org-institution-admin",
    email: "school@ahmedabad.edu",
    name: "Dr. Anand Patel",
  },
  societyRequestIds: [
    "demo-org-society-request-plumbing",
    "demo-org-society-request-electrical",
    "demo-org-society-request-garden",
  ],
  institutionRequestIds: [
    "demo-org-institution-request-cleaning",
    "demo-org-institution-request-electrical",
    "demo-org-institution-request-ac",
  ],
  maintenanceContractIds: [
    "demo-org-maintenance-contract-elevator",
    "demo-org-maintenance-contract-ac",
  ],
  institutionContractId: "demo-org-institution-contract-annual-maintenance",
  bookingIds: [
    "demo-org-booking-society-plumbing",
    "demo-org-booking-society-electrical",
    "demo-org-booking-society-garden",
    "demo-org-booking-institution-cleaning",
    "demo-org-booking-institution-electrical",
    "demo-org-booking-institution-ac",
  ],
} as const;

type Category = {
  id: string;
  name: string;
  basePrice: number;
};

type QualifiedWorker = {
  id: string;
  primaryTrade: string | null;
  verificationStatus: string;
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function ensureSame(label: string, actual: unknown, expected: unknown) {
  if (actual !== expected) {
    throw new Error(`${label} mismatch: expected ${String(expected)}, found ${String(actual)}`);
  }
}

async function ensureSociety() {
  const matches = await prisma.housingSociety.findMany({
    where: { name: ORGANIZATION_DEMO.society.name },
    orderBy: { id: "asc" },
  });

  if (matches.length > 1) {
    throw new Error(`More than one HousingSociety named ${ORGANIZATION_DEMO.society.name} exists; refusing to guess.`);
  }

  if (matches[0]) {
    ensureSame("HousingSociety city", matches[0].city, ORGANIZATION_DEMO.society.city);
    ensureSame("HousingSociety units", matches[0].units, ORGANIZATION_DEMO.society.units);
    return matches[0];
  }

  const idCollision = await prisma.housingSociety.findUnique({ where: { id: ORGANIZATION_DEMO.society.id } });
  if (idCollision) {
    throw new Error(`Deterministic society id ${ORGANIZATION_DEMO.society.id} is already used by another record.`);
  }

  return prisma.housingSociety.create({
    data: {
      id: ORGANIZATION_DEMO.society.id,
      name: ORGANIZATION_DEMO.society.name,
      address: "Sunrise Road, Ahmedabad",
      units: ORGANIZATION_DEMO.society.units,
      contactPerson: "Mihir Shah",
      contactPhone: "+919520000001",
      ...AHMEDABAD,
    },
  });
}

async function ensureInstitution() {
  const matches = await prisma.institution.findMany({
    where: { name: ORGANIZATION_DEMO.institution.name },
    orderBy: { id: "asc" },
  });

  if (matches.length > 1) {
    throw new Error(`More than one Institution named ${ORGANIZATION_DEMO.institution.name} exists; refusing to guess.`);
  }

  if (matches[0]) {
    ensureSame("Institution city", matches[0].city, ORGANIZATION_DEMO.institution.city);
    ensureSame("Institution type", matches[0].type, ORGANIZATION_DEMO.institution.type);
    return matches[0];
  }

  const idCollision = await prisma.institution.findUnique({ where: { id: ORGANIZATION_DEMO.institution.id } });
  if (idCollision) {
    throw new Error(`Deterministic institution id ${ORGANIZATION_DEMO.institution.id} is already used by another record.`);
  }

  return prisma.institution.create({
    data: {
      id: ORGANIZATION_DEMO.institution.id,
      name: ORGANIZATION_DEMO.institution.name,
      type: ORGANIZATION_DEMO.institution.type,
      address: "School Road, Ahmedabad",
      contactPerson: "Dr. Anand Patel",
      contactPhone: "+919876543220",
      ...AHMEDABAD,
    },
  });
}

async function ensureUser(input: {
  id: string;
  email: string;
  name: string;
  role: "SOCIETY_ADMIN" | "INSTITUTIONAL_CUSTOMER";
}, passwordHash: string) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    ensureSame(`${input.email} role`, existing.role, input.role);
    if (!existing.isActive) {
      throw new Error(`${input.email} is inactive; refusing to change an existing account.`);
    }
    return existing;
  }

  const idCollision = await prisma.user.findUnique({ where: { id: input.id } });
  if (idCollision) {
    throw new Error(`Deterministic user id ${input.id} is already used by another account.`);
  }

  return prisma.user.create({
    data: {
      id: input.id,
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
      isActive: true,
      language: "en",
    },
  });
}

async function ensureAdmins(societyId: string, institutionId: string, passwordHash: string) {
  const societyUser = await ensureUser(
    {
      id: ORGANIZATION_DEMO.societyAdmin.userId,
      email: ORGANIZATION_DEMO.societyAdmin.email,
      name: ORGANIZATION_DEMO.societyAdmin.name,
      role: "SOCIETY_ADMIN",
    },
    passwordHash,
  );
  const societyAdmin = await prisma.societyAdmin.findUnique({ where: { userId: societyUser.id } });
  if (societyAdmin && societyAdmin.societyId !== societyId) {
    throw new Error(`${ORGANIZATION_DEMO.societyAdmin.email} is already linked to another society.`);
  }
  if (!societyAdmin) {
    await prisma.societyAdmin.create({
      data: {
        id: ORGANIZATION_DEMO.societyAdmin.adminId,
        userId: societyUser.id,
        societyId,
      },
    });
  }

  const institutionUser = await ensureUser(
    {
      id: ORGANIZATION_DEMO.institutionAdmin.userId,
      email: ORGANIZATION_DEMO.institutionAdmin.email,
      name: ORGANIZATION_DEMO.institutionAdmin.name,
      role: "INSTITUTIONAL_CUSTOMER",
    },
    passwordHash,
  );
  const institutionAdmin = await prisma.institutionalCustomer.findUnique({ where: { userId: institutionUser.id } });
  if (institutionAdmin && institutionAdmin.institutionId !== institutionId) {
    throw new Error(`${ORGANIZATION_DEMO.institutionAdmin.email} is already linked to another institution.`);
  }
  if (!institutionAdmin) {
    await prisma.institutionalCustomer.create({
      data: {
        id: ORGANIZATION_DEMO.institutionAdmin.adminId,
        userId: institutionUser.id,
        institutionId,
      },
    });
  }
}

async function ensureMembers(societyId: string, institutionId: string) {
  const societyMembers = await prisma.customer.findMany({
    where: { housingSocietyId: societyId },
    orderBy: { id: "asc" },
  });
  const institutionMembers = await prisma.customer.findMany({
    where: { institutionId },
    orderBy: { id: "asc" },
  });

  const assignableCustomers = await prisma.customer.findMany({
    where: {
      housingSocietyId: null,
      institutionId: null,
      city: "Ahmedabad",
      state: "Gujarat",
    },
    orderBy: { id: "asc" },
  });

  let cursor = 0;
  while (societyMembers.length < SOCIETY_MEMBER_COUNT) {
    const customer = assignableCustomers[cursor++];
    if (!customer) {
      throw new Error(`At least ${SOCIETY_MEMBER_COUNT} existing Ahmedabad/Gujarat customers are required for society membership.`);
    }
    await prisma.customer.update({
      where: { id: customer.id },
      data: { housingSocietyId: societyId },
    });
    societyMembers.push({ ...customer, housingSocietyId: societyId });
  }

  while (institutionMembers.length < INSTITUTION_MEMBER_COUNT) {
    const customer = assignableCustomers[cursor++];
    if (!customer) {
      throw new Error(`At least ${INSTITUTION_MEMBER_COUNT} additional existing Ahmedabad/Gujarat customers are required for institution membership.`);
    }
    await prisma.customer.update({
      where: { id: customer.id },
      data: { institutionId },
    });
    institutionMembers.push({ ...customer, institutionId });
  }

  return {
    society: societyMembers.slice(0, SOCIETY_MEMBER_COUNT),
    institution: institutionMembers.slice(0, INSTITUTION_MEMBER_COUNT),
  };
}

async function loadCategories() {
  const categories = await prisma.serviceCategory.findMany({
    select: { id: true, name: true, basePrice: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  if (categories.length === 0) {
    throw new Error("No ServiceCategory records found. This organization seed never creates reference data.");
  }
  return categories;
}

async function findQualifiedWorker(category: Category, excludedWorkerIds: string[]) {
  const worker = await prisma.worker.findFirst({
    where: {
      verificationStatus: "VERIFIED",
      ...(excludedWorkerIds.length ? { id: { notIn: excludedWorkerIds } } : {}),
      OR: [
        { primaryTrade: category.name },
        { skills: { some: { skill: { categoryId: category.id } } } },
      ],
    },
    select: { id: true, primaryTrade: true, verificationStatus: true },
    orderBy: { id: "asc" },
  });
  return worker;
}

async function chooseCategory(
  categories: Category[],
  preferredNames: string[],
  usedCategoryIds: string[],
  usedWorkerIds: string[],
) {
  const preferred = preferredNames
    .map((name) => categories.find((category) => normalize(category.name) === normalize(name)))
    .filter((category): category is Category => Boolean(category));
  const candidates = [
    ...preferred,
    ...categories.filter((category) => !preferred.some((item) => item.id === category.id)),
  ];

  for (const category of candidates) {
    if (usedCategoryIds.includes(category.id)) continue;
    const worker = await findQualifiedWorker(category, usedWorkerIds);
    if (worker) return { category, worker };
  }

  for (const category of candidates) {
    const worker = await findQualifiedWorker(category, usedWorkerIds);
    if (worker) return { category, worker };
  }

  throw new Error(`No verified qualified worker exists for requested categories: ${preferredNames.join(", ")}`);
}

async function ensureSocietyRequest(input: {
  id: string;
  societyId: string;
  categoryId: string;
  title: string;
  description: string;
  priority: string;
  area: string;
  status: string;
  createdAt: Date;
}) {
  const existing = await prisma.societyServiceRequest.findUnique({ where: { id: input.id } });
  if (existing) {
    ensureSame(`${input.id} society`, existing.societyId, input.societyId);
    ensureSame(`${input.id} category`, existing.categoryId, input.categoryId);
    return existing;
  }

  const sameTitle = await prisma.societyServiceRequest.findFirst({
    where: { societyId: input.societyId, title: input.title },
  });
  if (sameTitle) {
    ensureSame(`${input.title} category`, sameTitle.categoryId, input.categoryId);
    return sameTitle;
  }

  return prisma.societyServiceRequest.create({
    data: {
      id: input.id,
      societyId: input.societyId,
      categoryId: input.categoryId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      area: input.area,
      status: input.status,
      createdAt: input.createdAt,
    },
  });
}

async function ensureInstitutionRequest(input: {
  id: string;
  institutionId: string;
  contractId: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  createdAt: Date;
}) {
  const existing = await prisma.institutionServiceRequest.findUnique({ where: { id: input.id } });
  if (existing) {
    ensureSame(`${input.id} institution`, existing.institutionId, input.institutionId);
    ensureSame(`${input.id} contract`, existing.contractId, input.contractId);
    return existing;
  }

  const sameTitle = await prisma.institutionServiceRequest.findFirst({
    where: { institutionId: input.institutionId, title: input.title },
  });
  if (sameTitle) {
    ensureSame(`${input.title} contract`, sameTitle.contractId, input.contractId);
    return sameTitle;
  }

  return prisma.institutionServiceRequest.create({
    data: {
      id: input.id,
      institutionId: input.institutionId,
      contractId: input.contractId,
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: input.status,
      createdAt: input.createdAt,
    },
  });
}

async function ensureMaintenanceContract(input: {
  id: string;
  societyId: string;
  title: string;
  frequency: string;
  categoryId?: string;
  nextService: Date;
  lastService: Date;
  cost: number;
}) {
  const existing = await prisma.maintenanceContract.findUnique({ where: { id: input.id } });
  if (existing) {
    ensureSame(`${input.id} society`, existing.societyId, input.societyId);
    return existing;
  }

  const sameTitle = await prisma.maintenanceContract.findFirst({
    where: { societyId: input.societyId, title: input.title },
  });
  if (sameTitle) return sameTitle;

  return prisma.maintenanceContract.create({ data: input });
}

async function ensureInstitutionContract(input: {
  id: string;
  institutionId: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  slaDetails: string;
  totalValue: number;
}) {
  const existing = await prisma.institutionContract.findUnique({ where: { id: input.id } });
  if (existing) {
    ensureSame(`${input.id} institution`, existing.institutionId, input.institutionId);
    return existing;
  }

  const sameTitle = await prisma.institutionContract.findFirst({
    where: { institutionId: input.institutionId, title: input.title },
  });
  if (sameTitle) return sameTitle;

  return prisma.institutionContract.create({ data: input });
}

async function ensureBooking(input: {
  id: string;
  customerId: string;
  workerId: string;
  categoryId: string;
  description: string;
  scheduledDate: Date;
  scheduledTime: string;
  estimatedPrice: number;
  address: string;
  societyRequestId?: string;
  institutionRequestId?: string;
  createdAt: Date;
}) {
  const existing = await prisma.booking.findUnique({ where: { id: input.id } });
  if (existing) {
    ensureSame(`${input.id} customer`, existing.customerId, input.customerId);
    ensureSame(`${input.id} worker`, existing.workerId, input.workerId);
    ensureSame(`${input.id} category`, existing.categoryId, input.categoryId);
    ensureSame(`${input.id} society request`, existing.societyRequestId, input.societyRequestId ?? null);
    ensureSame(`${input.id} institution request`, existing.institutionRequestId, input.institutionRequestId ?? null);
    return existing;
  }

  const parentWhere = input.societyRequestId
    ? { societyRequestId: input.societyRequestId }
    : { institutionRequestId: input.institutionRequestId };
  const sameParent = await prisma.booking.findFirst({ where: parentWhere });
  if (sameParent) return sameParent;

  const booking = await prisma.booking.create({
    data: {
      id: input.id,
      customerId: input.customerId,
      workerId: input.workerId,
      categoryId: input.categoryId,
      description: input.description,
      scheduledDate: input.scheduledDate,
      scheduledTime: input.scheduledTime,
      estimatedPrice: input.estimatedPrice,
      address: input.address,
      latitude: AHMEDABAD.latitude,
      longitude: AHMEDABAD.longitude,
      status: "REQUESTED",
      servicePin: "2468",
      pinVerified: false,
      createdAt: input.createdAt,
      societyRequestId: input.societyRequestId,
      institutionRequestId: input.institutionRequestId,
    },
  });

  await prisma.bookingStatusHistory.create({
    data: {
      id: `${input.id}-history-requested`,
      bookingId: booking.id,
      status: "REQUESTED",
      note: "Organization demo booking assigned to a qualified cooperative worker.",
      createdAt: input.createdAt,
    },
  });

  return booking;
}

export async function seedOrganizationDemo() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const [society, institution] = await Promise.all([ensureSociety(), ensureInstitution()]);

  await ensureAdmins(society.id, institution.id, passwordHash);
  const members = await ensureMembers(society.id, institution.id);
  const categories = await loadCategories();

  const societyContract = await ensureMaintenanceContract({
    id: ORGANIZATION_DEMO.maintenanceContractIds[0],
    societyId: society.id,
    title: "Monthly Elevator Safety Maintenance",
    frequency: "MONTHLY",
    nextService: new Date("2026-09-20T09:00:00+05:30"),
    lastService: new Date("2026-08-20T09:00:00+05:30"),
    cost: 5000,
  });
  const acCategory = categories.find((category) => ["AC Repair", "Air Conditioning", "AC Technician"].some((name) => normalize(name) === normalize(category.name))) ?? categories[0];
  const acContract = await ensureMaintenanceContract({
    id: ORGANIZATION_DEMO.maintenanceContractIds[1],
    societyId: society.id,
    title: "Quarterly Common-Area AC Maintenance",
    frequency: "QUARTERLY",
    categoryId: acCategory.id,
    nextService: new Date("2026-11-20T09:00:00+05:30"),
    lastService: new Date("2026-08-20T09:00:00+05:30"),
    cost: 15000,
  });
  void societyContract;
  void acContract;

  const institutionContract = await ensureInstitutionContract({
    id: ORGANIZATION_DEMO.institutionContractId,
    institutionId: institution.id,
    title: "Annual Campus Maintenance Contract",
    description: "Electrical, cleaning, and air-conditioning maintenance for the Ahmedabad campus.",
    startDate: new Date("2026-04-01T00:00:00+05:30"),
    endDate: new Date("2027-03-31T23:59:59+05:30"),
    slaDetails: JSON.stringify({ responseHours: 4, resolutionHours: 24, coverage: "campus-wide" }),
    totalValue: 240000,
  });

  const societySpecs = [
    {
      id: ORGANIZATION_DEMO.societyRequestIds[0],
      bookingId: ORGANIZATION_DEMO.bookingIds[0],
      preferredNames: ["Plumbing", "Plumber", "Plumbing Emergency"],
      title: "Common-area water leakage repair",
      description: "Repair a persistent water leak near the ground-floor common bathroom and inspect the adjoining pipework.",
      priority: "HIGH",
      area: "Common Area - Ground Floor",
      status: "SCHEDULED",
      customerIndex: 0,
      scheduledDate: "2026-09-09T10:00:00+05:30",
    },
    {
      id: ORGANIZATION_DEMO.societyRequestIds[1],
      bookingId: ORGANIZATION_DEMO.bookingIds[1],
      preferredNames: ["Electrical", "Electrician", "Electrical Emergency"],
      title: "Society electrical safety inspection",
      description: "Inspect corridor distribution boards, emergency lighting, and earthing before the monthly safety review.",
      priority: "NORMAL",
      area: "Tower A and Clubhouse",
      status: "SCHEDULED",
      customerIndex: 1,
      scheduledDate: "2026-09-11T11:00:00+05:30",
    },
    {
      id: ORGANIZATION_DEMO.societyRequestIds[2],
      bookingId: ORGANIZATION_DEMO.bookingIds[2],
      preferredNames: ["Gardener", "Gardening", "Lawn Maintenance"],
      title: "Monthly garden and lawn maintenance",
      description: "Trim the common lawn, prune the entrance plants, and replace two damaged drip-irrigation lines.",
      priority: "NORMAL",
      area: "Central Garden",
      status: "SCHEDULED",
      customerIndex: 2,
      scheduledDate: "2026-09-13T08:00:00+05:30",
    },
  ];

  const institutionSpecs = [
    {
      id: ORGANIZATION_DEMO.institutionRequestIds[0],
      bookingId: ORGANIZATION_DEMO.bookingIds[3],
      preferredNames: ["Deep Cleaning", "Cleaning", "Cleaner"],
      title: "Term-start classroom deep cleaning",
      description: "Deep-clean classrooms, corridors, and the library before the new academic term begins.",
      priority: "HIGH",
      status: "SCHEDULED",
      customerIndex: 0,
      scheduledDate: "2026-09-15T07:30:00+05:30",
    },
    {
      id: ORGANIZATION_DEMO.institutionRequestIds[1],
      bookingId: ORGANIZATION_DEMO.bookingIds[4],
      preferredNames: ["Electrical", "Electrician", "Electrical Emergency"],
      title: "Computer lab electrical audit",
      description: "Check sockets, circuit loading, and protective devices in the computer lab and staff rooms.",
      priority: "NORMAL",
      status: "SCHEDULED",
      customerIndex: 1,
      scheduledDate: "2026-09-16T10:30:00+05:30",
    },
    {
      id: ORGANIZATION_DEMO.institutionRequestIds[2],
      bookingId: ORGANIZATION_DEMO.bookingIds[5],
      preferredNames: ["AC Repair", "Air Conditioning", "AC Technician"],
      title: "Classroom AC servicing",
      description: "Service split AC units in the senior wing and investigate reduced cooling in two classrooms.",
      priority: "HIGH",
      status: "SCHEDULED",
      customerIndex: 0,
      scheduledDate: "2026-09-18T09:30:00+05:30",
    },
  ];

  const usedCategoryIds: string[] = [];
  const usedWorkerIds: string[] = [];
  const createdSocietyRequests = [];
  const createdInstitutionRequests = [];

  for (const spec of societySpecs) {
    const assignment = await chooseCategory(categories, spec.preferredNames, usedCategoryIds, usedWorkerIds);
    usedCategoryIds.push(assignment.category.id);
    usedWorkerIds.push(assignment.worker.id);
    const request = await ensureSocietyRequest({
      id: spec.id,
      societyId: society.id,
      categoryId: assignment.category.id,
      title: spec.title,
      description: spec.description,
      priority: spec.priority,
      area: spec.area,
      status: spec.status,
      createdAt: new Date(`${spec.scheduledDate.slice(0, 10)}T06:00:00+05:30`),
    });
    createdSocietyRequests.push(request);
    await ensureBooking({
      id: spec.bookingId,
      customerId: members.society[spec.customerIndex].id,
      workerId: assignment.worker.id,
      categoryId: assignment.category.id,
      description: spec.description,
      scheduledDate: new Date(spec.scheduledDate),
      scheduledTime: spec.scheduledDate.slice(11, 16),
      estimatedPrice: assignment.category.basePrice || 500,
      address: "Sunrise Apartments, Ahmedabad",
      societyRequestId: request.id,
      createdAt: new Date(`${spec.scheduledDate.slice(0, 10)}T06:15:00+05:30`),
    });
  }

  for (const spec of institutionSpecs) {
    const assignment = await chooseCategory(categories, spec.preferredNames, usedCategoryIds, usedWorkerIds);
    usedCategoryIds.push(assignment.category.id);
    usedWorkerIds.push(assignment.worker.id);
    const request = await ensureInstitutionRequest({
      id: spec.id,
      institutionId: institution.id,
      contractId: institutionContract.id,
      title: spec.title,
      description: spec.description,
      priority: spec.priority,
      status: spec.status,
      createdAt: new Date(`${spec.scheduledDate.slice(0, 10)}T06:00:00+05:30`),
    });
    createdInstitutionRequests.push(request);
    await ensureBooking({
      id: spec.bookingId,
      customerId: members.institution[spec.customerIndex].id,
      workerId: assignment.worker.id,
      categoryId: assignment.category.id,
      description: spec.description,
      scheduledDate: new Date(spec.scheduledDate),
      scheduledTime: spec.scheduledDate.slice(11, 16),
      estimatedPrice: assignment.category.basePrice || 500,
      address: "National School, Ahmedabad",
      institutionRequestId: request.id,
      createdAt: new Date(`${spec.scheduledDate.slice(0, 10)}T06:15:00+05:30`),
    });
  }

  return {
    society,
    institution,
    societyRequests: createdSocietyRequests,
    institutionRequests: createdInstitutionRequests,
  };
}

async function main() {
  console.log("Seeding organization demo data safely...");
  const result = await seedOrganizationDemo();
  console.log(`Society: ${result.society.name} (${result.society.id})`);
  console.log(`Institution: ${result.institution.name} (${result.institution.id})`);
  console.log(`Society requests ensured: ${result.societyRequests.length}`);
  console.log(`Institution requests ensured: ${result.institutionRequests.length}`);
  console.log("No workers, customers, service categories, payments, or auth architecture were recreated.");
}

if (process.argv[1]?.endsWith("seed-organization-demo.ts")) {
  main()
    .catch((error) => {
      console.error("Organization demo seed failed:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

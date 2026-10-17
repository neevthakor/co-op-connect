// Extracted logic from src/lib/scope.ts for testing without Next.js/server-only dependencies
type Scope = {
  role: string;
  cooperativeId?: string;
  federationId?: string;
  cooperativeIds?: string[];
};

function workerWhere(scope: Scope) {
  if (scope.role === "ADMIN") return {};
  if (scope.role === "COOPERATIVE_ADMIN") return { cooperativeId: scope.cooperativeId };
  if (scope.role === "FEDERATION_ADMIN") return { cooperativeId: { in: scope.cooperativeIds } };
  return { cooperativeId: "NONE" };
}

function cooperativeWhere(scope: Scope) {
  if (scope.role === "ADMIN") return {};
  if (scope.role === "COOPERATIVE_ADMIN") return { id: scope.cooperativeId };
  if (scope.role === "FEDERATION_ADMIN") return { id: { in: scope.cooperativeIds } };
  return { id: "NONE" };
}

function validateClientCooperativeId(scope: Scope, clientCooperativeId?: string | null): string | undefined {
  if (!clientCooperativeId) return undefined;
  
  if (scope.role === "ADMIN") return clientCooperativeId;
  
  if (scope.role === "COOPERATIVE_ADMIN") {
    if (clientCooperativeId !== scope.cooperativeId) {
      throw new Error("Forbidden: Cannot access other cooperative data");
    }
    return clientCooperativeId;
  }
  
  if (scope.role === "FEDERATION_ADMIN") {
    if (!scope.cooperativeIds?.includes(clientCooperativeId)) {
      throw new Error("Forbidden: Cannot access data for cooperative outside your federation");
    }
    return clientCooperativeId;
  }
  
  return undefined;
}

// MOCK getScope function
async function getScope(user: any): Promise<Scope> {
  if (user.role === "COOPERATIVE_ADMIN") {
    return {
      role: user.role,
      cooperativeId: user.cooperativeId,
      cooperativeIds: user.cooperativeId ? [user.cooperativeId] : [],
    };
  }
  if (user.role === "FEDERATION_ADMIN") {
    const federationId = user.federationId;
    if (!federationId) {
      return { role: user.role, federationId, cooperativeIds: [] };
    }
    // MOCK DB FETCH
    return {
      role: user.role,
      federationId,
      cooperativeIds: ['coop-A1', 'coop-A2'],
    };
  }
  return { role: user.role };
}

async function run() {
  let passed = 0;
  let failed = 0;

  function assertThrows(fn: () => void, testName: string) {
    try {
      fn();
      console.error(`❌ FAILED: ${testName} (did not throw)`);
      failed++;
    } catch (e) {
      console.log(`✅ PASSED: ${testName}`);
      passed++;
    }
  }

  function assertNotThrows(fn: () => void, testName: string) {
    try {
      fn();
      console.log(`✅ PASSED: ${testName}`);
      passed++;
    } catch (e) {
      console.error(`❌ FAILED: ${testName} (threw error)`);
      failed++;
    }
  }

  function assertEqual(actual: any, expected: any, testName: string) {
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
      console.log(`✅ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAILED: ${testName}\n  Expected: ${JSON.stringify(expected)}\n  Actual: ${JSON.stringify(actual)}`);
      failed++;
    }
  }

  console.log("Running Security Verification Tests...\n");

  // 1. Cooperative A admin cannot read/mutate Cooperative B data.
  const coopAScope: Scope = { role: 'COOPERATIVE_ADMIN', cooperativeId: 'coop-A' };
  assertThrows(() => validateClientCooperativeId(coopAScope, 'coop-B'), 'Cooperative A admin cannot access Cooperative B data');
  assertNotThrows(() => validateClientCooperativeId(coopAScope, 'coop-A'), 'Cooperative A admin CAN access Cooperative A data');
  assertEqual(workerWhere(coopAScope), { cooperativeId: 'coop-A' }, 'Cooperative A workerWhere is scoped to coop-A');
  assertEqual(cooperativeWhere(coopAScope), { id: 'coop-A' }, 'Cooperative A cooperativeWhere is scoped to coop-A');

  // 2. Federation A admin cannot read/mutate a cooperative belonging to Federation B.
  const fedAScope: Scope = { role: 'FEDERATION_ADMIN', federationId: 'fed-A', cooperativeIds: ['coop-A1', 'coop-A2'] };
  assertThrows(() => validateClientCooperativeId(fedAScope, 'coop-B'), 'Federation A admin cannot access Federation B cooperative');
  
  // 3. Federation A admin can access its own cooperatives.
  assertNotThrows(() => validateClientCooperativeId(fedAScope, 'coop-A1'), 'Federation A admin CAN access its own cooperative');
  assertEqual(workerWhere(fedAScope), { cooperativeId: { in: ['coop-A1', 'coop-A2'] } }, 'Federation A workerWhere is scoped to its cooperatives');
  assertEqual(cooperativeWhere(fedAScope), { id: { in: ['coop-A1', 'coop-A2'] } }, 'Federation A cooperativeWhere is scoped to its cooperatives');

  // 4. ADMIN can access global data.
  const adminScope: Scope = { role: 'ADMIN' };
  assertNotThrows(() => validateClientCooperativeId(adminScope, 'any-coop'), 'ADMIN can access any cooperative data');
  assertEqual(workerWhere(adminScope), {}, 'ADMIN workerWhere is global (unscoped)');
  assertEqual(cooperativeWhere(adminScope), {}, 'ADMIN cooperativeWhere is global (unscoped)');

  // 5. FEDERATION_ADMIN without a valid federationId fails closed
  const invalidFedAdmin = { role: 'FEDERATION_ADMIN', federationId: null };
  const getScopeResult = await getScope(invalidFedAdmin);
  assertEqual(getScopeResult.cooperativeIds, [], 'FEDERATION_ADMIN with no federationId gets empty cooperativeIds');
  assertThrows(() => validateClientCooperativeId(getScopeResult, 'any-coop'), 'FEDERATION_ADMIN with no valid federationId cannot access any cooperative');
  assertEqual(workerWhere(getScopeResult), { cooperativeId: { in: [] } }, 'FEDERATION_ADMIN with no valid federationId queries fail closed in Prisma');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

run();

import { prisma } from "@/lib/prisma";
import { haversineDistance } from "@/lib/utils";

export interface MatchParams {
  categoryId: string;
  latitude: number;
  longitude: number;
  urgency?: "NORMAL" | "URGENT" | "EMERGENCY";
  cooperativeId?: string;
  searchedAddress?: string;
}

export interface WorkerMatchResult {
  worker: { id: string; distance?: number; user?: { name?: string; avatar?: string | null }; averageRating?: number; [key: string]: unknown };
  match_score: number;
  score_breakdown: {
    skill: number;
    availability: number;
    distance: number;
    reliability: number;
    certification: number;
    fairness: number;
  };
  explanation: string;
}

/**
 * Extract the operational-area portion from a worker's persisted address.
 * Worker addresses follow the seed/registration pattern "<house number>, <area>"
 * (e.g. "142, Chandkheda"). Returns the area portion after the first comma,
 * normalized to lowercase and trimmed. If no comma is present, the entire
 * string is treated as the area.
 */
function extractOperationalArea(address: string): string {
  const commaIndex = address.indexOf(",");
  const raw = commaIndex >= 0 ? address.substring(commaIndex + 1) : address;
  return raw.trim().toLowerCase();
}

/**
 * Check whether a worker's persisted address matches the customer's searched
 * address/area string. Comparison is case-insensitive and whitespace-tolerant.
 *
 * The worker's operational area (extracted from their address) is compared
 * against each comma-separated part of the searched string AND against the
 * full searched string. This handles:
 *   worker "142, Chandkheda"  + search "Chandkheda"           → match
 *   worker "87, Satellite"    + search "satellite"             → match
 *   worker "142, Chandkheda"  + search "Main Rd, Chandkheda"  → match
 */
function matchesOperationalArea(
  workerAddress: string | null | undefined,
  searchedAddress: string | undefined
): boolean {
  if (!workerAddress || !searchedAddress) return false;

  const workerArea = extractOperationalArea(workerAddress);
  if (!workerArea) return false;

  const searchedFull = searchedAddress.trim().toLowerCase();
  if (!searchedFull) return false;

  // Direct match: full searched string equals the worker's area
  if (searchedFull === workerArea) return true;

  // Part-based match: any comma-separated part of the searched address
  // equals the worker's area
  const searchedParts = searchedAddress
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  return searchedParts.some((part) => part === workerArea);
}

export async function matchWorkers(params: MatchParams): Promise<WorkerMatchResult[]> {
  const { categoryId, latitude, longitude, urgency = "NORMAL", cooperativeId, searchedAddress } = params;

  // Retrieve cooperative matching weights or default
  let weights = {
    skillWeight: 0.35,
    availabilityWeight: 0.20,
    distanceWeight: 0.15,
    reliabilityWeight: 0.10,
    certificationWeight: 0.10,
    fairnessWeight: 0.10,
  };

  if (cooperativeId) {
    const coopWeights = await prisma.matchingWeights.findUnique({
      where: { cooperativeId },
    });
    if (coopWeights) {
      weights = coopWeights;
    }
  }

  const categoryData = await prisma.serviceCategory.findUnique({
    where: { id: categoryId },
    include: { skills: true }
  });

  if (!categoryData) {
    throw new Error(`Invalid categoryId: ${categoryId}`);
  }

  const dynamicTrades = new Set<string>();
  if (categoryData.name) dynamicTrades.add(categoryData.name);
  if (categoryData.skills) {
    categoryData.skills.forEach(s => dynamicTrades.add(s.name));
  }

  const allowedTradesArray = Array.from(dynamicTrades);

  const totalWorkersInDb = await prisma.worker.count();

  // 1. Filter eligible workers (verified, belongs to trade/skills in category)
  // OFFLINE workers are included in discovery so they remain visible when
  // searching by area/location. The availability scoring below naturally
  // ranks them lower than AVAILABLE or BUSY workers.
  const workers = await prisma.worker.findMany({
    where: {
      verificationStatus: "VERIFIED",
      ...(cooperativeId ? { cooperativeId } : {}),
      OR: [
        {
          skills: {
            some: {
              skill: {
                categoryId,
              },
            },
          }
        },
        ...(allowedTradesArray.length > 0 ? [{
          primaryTrade: {
            in: allowedTradesArray
          }
        }] : [])
      ]
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          phone: true,
        },
      },
      cooperative: true,
      skills: {
        include: {
          skill: true,
        },
      },
      certifications: {
        include: {
          certification: true,
        },
      },
    },
  });

  const scoredResults: WorkerMatchResult[] = [];
  let excludedByDistance = 0;

  for (const worker of workers) {
    // 1. Skill Compatibility (0 - 100)
    // FIX: a worker with no real skill record for this category (matched only via
    // the loose primaryTrade text fallback) should score noticeably lower than one
    // with an actual, verified skill entry — not the same 70 as before.
    const matchingSkill = worker.skills.find(
      (ws) => ws.skill.categoryId === categoryId
    );
    let skillScore = 45; // no matching skill record — matched on primaryTrade text only
    if (matchingSkill?.proficiencyLevel === "EXPERT") skillScore = 100;
    else if (matchingSkill?.proficiencyLevel === "ADVANCED") skillScore = 90;
    else if (matchingSkill?.proficiencyLevel === "INTERMEDIATE") skillScore = 80;
    else if (matchingSkill) skillScore = 65; // has a skill record but no/unknown proficiency

    // 2. Availability (0 - 100)
    // OFFLINE workers are discoverable but scored low so AVAILABLE/BUSY workers
    // always rank above them when all other factors are equal.
    let availabilityScore = 50;
    if (worker.availabilityStatus === "AVAILABLE") availabilityScore = 100;
    else if (worker.availabilityStatus === "BUSY") availabilityScore = 40;
    else if (worker.availabilityStatus === "OFFLINE") availabilityScore = 20;
    if (urgency === "EMERGENCY" && worker.isEmergencyAvailable) {
      availabilityScore = 100;
    }

    // 3. Distance (0 - 100)
    // FIX: if a worker has no coordinates on file, don't guess "5km" (that fabricates
    // a favorable distance score) — push them to the bottom on this factor instead.
    let distanceKm: number | null = null;
    if (worker.latitude && worker.longitude) {
      distanceKm = haversineDistance(
        latitude,
        longitude,
        worker.latitude,
        worker.longitude
      );
    }
    const maxRadius = worker.serviceRadius || 15;

    // Discovery qualification: a worker enters the candidate pool if they satisfy
    // EITHER an exact/normalized operational-area match OR GPS proximity within
    // the platform discovery radius. Neither condition requires the worker to be
    // online. serviceRadius is NOT used as a discovery gate — only for scoring.
    const WORKER_LOCATION_MATCH_RADIUS_KM = 7;
    const exactAreaMatch = matchesOperationalArea(worker.address, searchedAddress);
    const withinDiscoveryRadius = distanceKm !== null && distanceKm <= WORKER_LOCATION_MATCH_RADIUS_KM;

    if (!exactAreaMatch && !withinDiscoveryRadius) {
      excludedByDistance++;
      continue;
    }

    // Distance scoring: workers with known GPS get a score normalized against
    // their serviceRadius; area-matched workers without GPS get a baseline of 0
    // (unknown distance = lowest distance score, but they still appear in results).
    const distanceScore = distanceKm !== null
      ? Math.max(0, Math.round((1 - Math.min(distanceKm, maxRadius) / maxRadius) * 100))
      : 0;

    // 4. Reliability (0 - 100)
    // FIX: don't default an unrated worker to 4.5/5 — that lets brand-new workers
    // with zero jobs outrank proven ones. Use a neutral 3.0 default instead, and only
    // let completion rate count once the worker actually has a job history.
    const hasRatingHistory = worker.totalJobs && worker.totalJobs > 0;
    const ratingComponent = ((worker.averageRating ?? 3.0) / 5) * 50;
    const completionComponent = hasRatingHistory
      ? ((worker.completionRate ?? 80) / 100) * 50
      : 25; // neutral midpoint for workers with no completed jobs yet
    const reliabilityScore = Math.round(ratingComponent + completionComponent);

    // 5. Certification (0 - 100)
    const hasCert = worker.certifications.some((c) => c.verified);
    const certScore = hasCert ? 100 : 70;

    // 6. Fairness (Starvation Prevention / Workload Balance) (0 - 100)
    // Fewer recent jobs = higher priority
    const jobs = worker.totalJobs || 0;
    const fairnessScore = Math.max(40, Math.min(100, 100 - Math.round(jobs * 0.2)));

    // Composite Weighted Score
    const totalScore = Math.round(
      skillScore * weights.skillWeight +
      availabilityScore * weights.availabilityWeight +
      distanceScore * weights.distanceWeight +
      reliabilityScore * weights.reliabilityWeight +
      certScore * weights.certificationWeight +
      fairnessScore * weights.fairnessWeight
    );

    // FIX: worker.averageRating can be null/undefined for new workers — this used to
    // crash on .toFixed(1). Use the same fallback as the scoring above.
    const displayRating = (worker.averageRating ?? 3.0).toFixed(1);
    const distanceLabel = distanceKm === null ? "an unknown distance" : `~${distanceKm.toFixed(1)} km`;
    const explanation = `Recommended because this worker has ${matchingSkill ? "verified" : "listed"} skills for this service, is located ${distanceLabel} away with a ${displayRating} rating, and is fairly prioritized under cooperative workload distribution.`;

    scoredResults.push({
      worker: {
        ...worker,
        distance: distanceKm ?? undefined,
      },
      // FIX: removed the artificial 50-point floor. A weak match should be able to
      // show as weak (e.g. 20-40) instead of always displaying as 50+.
      match_score: Math.min(99, Math.max(0, totalScore)),
      score_breakdown: {
        skill: skillScore,
        availability: availabilityScore,
        distance: distanceScore,
        reliability: reliabilityScore,
        certification: certScore,
        fairness: fairnessScore,
      },
      explanation,
    });
  }

  const finalMatches = scoredResults.sort((a, b) => b.match_score - a.match_score);

  console.log(`[Diagnostic] matchWorkers request:
- categoryId: ${categoryId}
- latitude/longitude: ${latitude}, ${longitude}
- cooperativeId: ${cooperativeId || 'none'}
- workers before filtering (total in DB): ${totalWorkersInDb}
- workers after eligibility filtering (verified, trade/skill match, includes OFFLINE): ${workers.length}
- excluded because of distance (outside both serviceRadius and ${7}km discovery radius): ${excludedByDistance}
- final matches: ${finalMatches.length}`);

  return finalMatches;
}
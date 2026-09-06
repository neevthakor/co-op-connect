import { prisma } from "@/lib/prisma";
import { haversineDistance } from "@/lib/utils";

export interface MatchParams {
  categoryId: string;
  latitude: number;
  longitude: number;
  urgency?: "NORMAL" | "URGENT" | "EMERGENCY";
  cooperativeId?: string;
}

export interface WorkerMatchResult {
  worker: any;
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

export async function matchWorkers(params: MatchParams): Promise<WorkerMatchResult[]> {
  const { categoryId, latitude, longitude, urgency = "NORMAL", cooperativeId } = params;

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

  // Dynamically resolve allowable trades from the database using ServiceCategory and Skills
  const categoryData = await prisma.serviceCategory.findUnique({
    where: { id: categoryId },
    include: { skills: true }
  });

  const dynamicTrades = new Set<string>();
  if (categoryData?.name) dynamicTrades.add(categoryData.name);
  if (categoryData?.skills) {
    categoryData.skills.forEach(s => dynamicTrades.add(s.name));
  }

  // Graceful fallback purely to prevent breaking existing workers if the production database is unseeded
  if (dynamicTrades.size === 0) {
    const fallbackMap: Record<string, string[]> = {
      'cat-ac': ['AC Repair', 'Appliance Repair'],
      'cat-plumb': ['Plumber'],
      'cat-elec': ['Electrician'],
      'cat-carp': ['Carpenter'],
      'cat-paint': ['Painter'],
      'cat-clean': ['Cleaner'],
      'cat-appliance': ['Appliance Repair', 'AC Repair'],
    };
    (fallbackMap[categoryId] || []).forEach(t => dynamicTrades.add(t));
  }

  const allowedTradesArray = Array.from(dynamicTrades);

  // 1. Filter eligible workers (verified, belongs to trade/skills in category)
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

  for (const worker of workers) {
    // 1. Skill Compatibility (0 - 100)
    const matchingSkill = worker.skills.find(
      (ws) => ws.skill.categoryId === categoryId
    );
    let skillScore = 70;
    if (matchingSkill?.proficiencyLevel === "EXPERT") skillScore = 100;
    else if (matchingSkill?.proficiencyLevel === "ADVANCED") skillScore = 90;
    else if (matchingSkill?.proficiencyLevel === "INTERMEDIATE") skillScore = 80;

    // 2. Availability (0 - 100)
    let availabilityScore = 50;
    if (worker.availabilityStatus === "AVAILABLE") availabilityScore = 100;
    else if (worker.availabilityStatus === "BUSY") availabilityScore = 40;
    if (urgency === "EMERGENCY" && worker.isEmergencyAvailable) {
      availabilityScore = 100;
    }

    // 3. Distance (0 - 100)
    let distanceKm = 5;
    if (worker.latitude && worker.longitude) {
      distanceKm = haversineDistance(
        latitude,
        longitude,
        worker.latitude,
        worker.longitude
      );
    }
    const maxRadius = worker.serviceRadius || 15;
    
    // EXCLUDE DISTANT WORKERS
    if (distanceKm > maxRadius) {
      continue;
    }

    const distanceScore = Math.max(0, Math.round((1 - Math.min(distanceKm, maxRadius) / maxRadius) * 100));

    // 4. Reliability (0 - 100)
    const ratingComponent = ((worker.averageRating || 4.5) / 5) * 50;
    const completionComponent = ((worker.completionRate || 95) / 100) * 50;
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

    const explanation = `Recommended because this worker has verified skills for this service, is located ~${distanceKm.toFixed(1)} km away with a ${worker.averageRating.toFixed(1)} rating, and is fairly prioritized under cooperative workload distribution.`;

    scoredResults.push({
      worker: {
        ...worker,
        distance: distanceKm,
      },
      match_score: Math.min(99, Math.max(50, totalScore)),
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

  return scoredResults.sort((a, b) => b.match_score - a.match_score);
}

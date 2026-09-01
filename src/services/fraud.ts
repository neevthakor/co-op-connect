import { prisma } from "@/lib/prisma";

export async function runFraudChecks() {
  console.log("[Fraud Detection] Running background checks...");
}

export async function checkRepeatedCancellations(customerId: string) {
  const cancellations = await prisma.bookingStatusHistory.count({
    where: {
      status: "CANCELLED",
      booking: {
        customerId,
      },
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  if (cancellations >= 3) {
    await createFraudAlert(
      "REPEATED_CANCELLATIONS",
      "CUSTOMER",
      customerId,
      "HIGH",
      "Customer cancelled 3 or more bookings in the last 7 days.",
      { cancellations }
    );
  }
}

export async function checkUnusualReviews(workerId: string) {
  const recentRatings = await prisma.rating.count({
    where: {
      workerId,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });

  if (recentRatings >= 5) {
    await createFraudAlert(
      "UNUSUAL_REVIEWS",
      "WORKER",
      workerId,
      "MEDIUM",
      "Worker received unusually high number of reviews in a 24-hour window.",
      { reviewCount24h: recentRatings }
    );
  }
}

export async function createFraudAlert(
  type: string,
  entityType: string,
  entityId: string,
  riskLevel: string,
  reason: string,
  evidence?: any
) {
  return prisma.fraudAlert.create({
    data: {
      type,
      entityType,
      entityId,
      riskLevel,
      reason,
      evidence: evidence ? JSON.stringify(evidence) : null,
      status: "OPEN",
    },
  });
}

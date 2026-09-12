import { prisma } from "@/lib/prisma";

import { detectFraud } from './ai';

export async function runFraudChecks(customerId: string, workerId: string, bookingId: string, actualPrice?: number, estimatedPrice?: number) {
  console.log("[Fraud Detection] Running background checks...");
  
  const cancellations = await prisma.bookingStatusHistory.count({
    where: { status: "CANCELLED", booking: { customerId }, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
  });

  const recentRatings = await prisma.rating.count({
    where: { workerId, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
  });

  const priceDifference = (actualPrice && estimatedPrice && estimatedPrice > 0) 
    ? Math.abs((actualPrice - estimatedPrice) / estimatedPrice) * 100 
    : 0;

  const result = await detectFraud({ cancellations, recentRatings, priceDifference });

  if (result.isSuspicious) {
    await createFraudAlert(
      "AI_FRAUD_DETECTION",
      "BOOKING",
      bookingId,
      result.riskScore > 0.7 ? "CRITICAL" : "HIGH",
      `AI flagged suspicious behavior: ${result.anomalies.join(', ')}`,
      { riskScore: result.riskScore, anomalies: result.anomalies }
    );
  }
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
  evidence?: Record<string, unknown>
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

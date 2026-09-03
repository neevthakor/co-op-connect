import { prisma } from '@/lib/prisma';
import { WorkerReview } from '@/types/review';

export interface WorkerProfileData {
  worker: any;
  completedJobsCount: number;
  averageRating: number | null;
  totalRatingsCount: number;
  punctualityScore: number | null;
  skills: any[];
  certifications: any[];
  recentReviews: WorkerReview[];
  availability: any[];
  earningsSummary: {
    grossTotal: number;
    cooperativeTotal: number;
    welfareTotal: number;
    netTotal: number;
  };
}

export async function getWorkerProfile(workerId: string): Promise<WorkerProfileData | null> {
  const workerPromise = prisma.worker.findUnique({
    where: { id: workerId },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, avatar: true },
      },
      cooperative: true,
      skills: { include: { skill: true }, orderBy: { createdAt: 'asc' } },
      certifications: { include: { certification: true }, orderBy: { createdAt: 'asc' } },
      availability: { orderBy: { dayOfWeek: 'asc' } },
    },
  });

  const completedJobsCountPromise = prisma.booking.count({
    where: { workerId, status: 'COMPLETED' },
  });

  const ratingsPromise = prisma.rating.findMany({
    where: { workerId },
    include: {
      customer: { include: { user: { select: { name: true, avatar: true } } } },
      booking: { include: { category: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const earningsPromise = prisma.workerEarning.aggregate({
    where: { workerId },
    _sum: {
      grossAmount: true,
      cooperativeDeduction: true,
      welfareDeduction: true,
      netAmount: true,
    },
  });

  const [worker, completedJobsCount, ratings, earningsAgg] = await Promise.all([
    workerPromise,
    completedJobsCountPromise,
    ratingsPromise,
    earningsPromise,
  ]);

  if (!worker) return null;

  const totalRatingsCount = ratings.length;
  let averageRating: number | null = null;
  let punctualityScore: number | null = null;

  if (totalRatingsCount > 0) {
    const sumRating = ratings.reduce((sum, r) => sum + r.overall, 0);
    averageRating = Number((sumRating / totalRatingsCount).toFixed(1));

    if (totalRatingsCount >= 2) {
      const sumPunctuality = ratings.reduce((sum, r) => sum + r.punctuality, 0);
      punctualityScore = Math.round((sumPunctuality / (totalRatingsCount * 5)) * 100);
    }
  }

  const canonicalReviews: WorkerReview[] = ratings.map((r) => ({
    id: r.id,
    rating: Number(r.overall.toFixed(1)),
    comment: r.review && r.review.trim().length > 0 ? r.review.trim() : null,
    createdAt: r.createdAt.toISOString(),
    technicalQuality: r.technicalQuality,
    punctuality: r.punctuality,
    communication: r.communication,
    professionalism: r.professionalism,
    priceTransparency: r.priceTransparency,
    customer: {
      name: r.customer?.user?.name || 'Customer',
      avatar: r.customer?.user?.avatar || null,
    },
    serviceCategory: r.booking?.category?.name || null,
  }));

  const earningsSummary = {
    grossTotal: earningsAgg._sum.grossAmount || 0,
    cooperativeTotal: earningsAgg._sum.cooperativeDeduction || 0,
    welfareTotal: earningsAgg._sum.welfareDeduction || 0,
    netTotal: earningsAgg._sum.netAmount || 0,
  };

  return {
    worker,
    completedJobsCount,
    averageRating,
    totalRatingsCount,
    punctualityScore,
    skills: worker.skills,
    certifications: worker.certifications,
    recentReviews: canonicalReviews,
    availability: worker.availability,
    earningsSummary,
  };
}

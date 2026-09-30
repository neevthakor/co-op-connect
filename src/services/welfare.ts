import { prisma } from "@/lib/prisma";

export async function checkWorkerWelfare(workerId: string) {
  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    include: {
      earnings: {
        orderBy: { date: "desc" },
        take: 30,
      },
      welfareRecords: {
        orderBy: { date: "desc" },
        take: 5,
      },
      insuranceRecords: true,
      trainingRecords: true,
    },
  });

  if (!worker) throw new Error("Worker not found");

  const totalEarningsThisMonth = worker.earnings.reduce(
    (sum, e) => sum + e.netAmount,
    0,
  );
  const totalJobs = worker.totalJobs;
  const isWorkloadHigh = worker.totalJobs > 30; // excessive monthly burden flag

  return {
    workerId,
    totalEarningsThisMonth,
    totalJobs,
    isWorkloadHigh,
    hasInsurance: worker.insuranceRecords.length > 0,
    hasTraining: worker.trainingRecords.length > 0,
    welfareRecords: worker.welfareRecords,
  };
}

export async function createWelfareAlert(
  workerId: string,
  type: string,
  details: string,
) {
  return prisma.welfareRecord.create({
    data: {
      workerId,
      type,
      details,
    },
  });
}

export async function getWelfareFundSummary(federationId: string) {
  const fund = await prisma.welfareFund.findUnique({
    where: { federationId },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!fund) {
    return {
      balance: 0,
      workersCovered: 0,
      payoutsThisPeriod: 0,
      transactions: [],
    };
  }

  const workersCovered = await prisma.worker.count({
    where: {
      cooperative: {
        federationId,
      },
    },
  });

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const payoutsThisPeriod = fund.transactions
    .filter(
      (t) =>
        t.createdAt >= firstDayOfMonth &&
        (t.type === "INSURANCE_PREMIUM" ||
          t.type === "EMERGENCY_ADVANCE" ||
          t.type === "TRAINING_VOUCHER"),
    )
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    balance: fund.balance,
    workersCovered,
    payoutsThisPeriod,
    transactions: fund.transactions,
  };
}

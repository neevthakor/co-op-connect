import { prisma } from "@/lib/prisma";
import { sendNotification } from "./notification";

export interface ProcessPaymentParams {
  bookingId: string;
  amount: number;
  method?: string;
  provider?: string;
}

export async function processPayment(params: ProcessPaymentParams) {
  const { bookingId, amount, method = "UPI", provider = "SANDBOX" } = params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      worker: { include: { user: true } },
      customer: { include: { user: true } },
      team: {
        include: {
          members: {
            include: {
              worker: { include: { user: true } },
            },
          },
        },
      },
      invoice: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

  // 1. Create or update Payment
  const payment = await prisma.payment.upsert({
    where: { bookingId },
    create: {
      bookingId,
      amount,
      method,
      provider,
      status: "COMPLETED",
      transactionId,
      paidAt: new Date(),
    },
    update: {
      amount,
      method,
      provider,
      status: "COMPLETED",
      transactionId,
      paidAt: new Date(),
    },
  });

  // 2. Mark Invoice as PAID
  if (booking.invoice) {
    await prisma.invoice.update({
      where: { id: booking.invoice.id },
      data: { status: "PAID" },
    });
  }

  // 3. Record Worker Earnings
  const labourCharge = booking.invoice?.labourCharge || Math.round(amount * 0.7);
  const travelCharge = booking.invoice?.travelCharge || Math.round(amount * 0.1);
  const materialCharge = booking.invoice?.materialCharge || 0;

  if (booking.team && booking.team.members.length > 0) {
    // Team split
    for (const member of booking.team.members) {
      const share = member.revenueShare || (member.role === "LEAD" ? 70 : 30);
      const memberLabour = Math.round((labourCharge * share) / 100);
      const memberTravel = member.role === "LEAD" ? travelCharge : 0;
      const memberMaterial = member.role === "LEAD" ? materialCharge : 0;
      const gross = memberLabour + memberTravel + memberMaterial;
      const coOpFee = Math.round(gross * 0.05);
      const welfareFee = Math.round(gross * 0.02);
      const net = gross - coOpFee - welfareFee;

      await prisma.workerEarning.create({
        data: {
          workerId: member.workerId,
          bookingId,
          grossAmount: gross,
          labourAmount: memberLabour,
          travelAmount: memberTravel,
          materialAmount: memberMaterial,
          cooperativeDeduction: coOpFee,
          welfareDeduction: welfareFee,
          netAmount: net,
          description: `Team (${member.role} ${share}%) - Booking #${booking.id.slice(0, 8)}`,
        },
      });
    }
  } else {
    // Single worker
    const gross = labourCharge + travelCharge + materialCharge;
    const coOpFee = Math.round(gross * 0.05);
    const welfareFee = Math.round(gross * 0.02);
    const net = gross - coOpFee - welfareFee;

    await prisma.workerEarning.create({
      data: {
        workerId: booking.workerId,
        bookingId,
        grossAmount: gross,
        labourAmount: labourCharge,
        travelAmount: travelCharge,
        materialAmount: materialCharge,
        cooperativeDeduction: coOpFee,
        welfareDeduction: welfareFee,
        netAmount: net,
        description: `Service Earning - Booking #${booking.id.slice(0, 8)}`,
      },
    });
  }

  // 4. Create / Activate Warranty (30 days)
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30);

  await prisma.warranty.upsert({
    where: { bookingId },
    create: {
      bookingId,
      expiryDate,
      status: "ACTIVE",
    },
    update: {
      expiryDate,
      status: "ACTIVE",
    },
  });

  // 5. Send Notifications
  if (booking.worker?.user?.id) {
    await sendNotification(
      booking.worker.user.id,
      "PAYMENT",
      "Payment Received!",
      `Customer has completed payment of ₹${amount} for Booking #${booking.id.slice(0, 8)}. Net earnings have been credited to your ledger.`,
      { bookingId, amount }
    );
  }

  if (booking.customer?.user?.id) {
    await sendNotification(
      booking.customer.user.id,
      "PAYMENT",
      "Payment Successful",
      `Your payment of ₹${amount} was successful. 30-day service warranty is now active!`,
      { bookingId, amount, warrantyValidUntil: expiryDate }
    );
  }

  return {
    success: true,
    payment,
    transactionId,
    amount,
    status: "COMPLETED",
  };
}

export async function getPaymentStatus(bookingId: string) {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
  });
  return payment || { status: "PENDING" };
}

export async function refundPayment(bookingId: string) {
  const payment = await prisma.payment.update({
    where: { bookingId },
    data: { status: "REFUNDED" },
  });
  return {
    success: true,
    payment,
    status: "REFUNDED",
  };
}


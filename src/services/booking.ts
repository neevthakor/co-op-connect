import { prisma } from "@/lib/prisma";
import { generatePin } from "@/lib/utils";
import { sendNotification } from "./notification";
import { generateInvoice } from "./invoice";

export async function createBooking(params: {
  customerId: string;
  workerId: string;
  categoryId: string;
  description?: string;
  scheduledDate?: Date;
  scheduledTime?: string;
  estimatedPrice?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  isEmergency?: boolean;
}) {
  // Validate worker eligibility and verification
  const worker = await prisma.worker.findUnique({
    where: { id: params.workerId },
  });

  if (!worker) {
    throw new Error("Worker not found");
  }

  if (worker.verificationStatus !== "VERIFIED") {
    throw new Error("Worker is not currently eligible for new bookings");
  }

  // Check for scheduling conflicts
  if (params.scheduledDate && params.scheduledTime) {
    const conflicting = await prisma.booking.findFirst({
      where: {
        workerId: params.workerId,
        scheduledDate: params.scheduledDate,
        scheduledTime: params.scheduledTime,
        status: {
          in: ["REQUESTED", "ACCEPTED", "TRAVELLING", "ARRIVED", "IN_PROGRESS"]
        }
      }
    });

    if (conflicting) {
      throw new Error("This worker is no longer available for the selected time. Please choose another worker or time.");
    }
  }

  const servicePin = generatePin();

  const booking = await prisma.booking.create({
    data: {
      ...params,
      status: "REQUESTED",
      servicePin,
      pinVerified: false,
    },
    include: {
      category: true,
      worker: { include: { user: true } },
      customer: { include: { user: true } },
    },
  });

  await prisma.bookingStatusHistory.create({
    data: {
      bookingId: booking.id,
      status: "REQUESTED",
      note: "Booking created by customer",
    },
  });

  // Notify worker of new booking
  if (booking.worker?.user?.id) {
    await sendNotification(
      booking.worker.user.id,
      "BOOKING",
      "New Job Request",
      `You have a new ${booking.category.name} booking request at ${booking.address || 'your location'}.`,
      { bookingId: booking.id, category: booking.category.name }
    );
  }

  return booking;
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
  note?: string
) {
  const validTransitions: Record<string, string[]> = {
    REQUESTED: ["ACCEPTED", "CANCELLED"],
    ACCEPTED: ["TRAVELLING", "CANCELLED"],
    TRAVELLING: ["ARRIVED", "CANCELLED"],
    ARRIVED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      category: true,
      worker: { include: { user: true } },
      customer: { include: { user: true } },
      invoice: true,
    },
  });

  if (!booking) throw new Error("Booking not found");

  if (newStatus !== "CANCELLED" && booking.status !== newStatus) {
    const allowed = validTransitions[booking.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from ${booking.status} to ${newStatus}`);
    }
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: newStatus,
      completedAt: newStatus === "COMPLETED" ? new Date() : undefined,
    },
    include: {
      category: true,
      worker: { include: { user: true } },
      customer: { include: { user: true } },
      invoice: true,
      jobProofs: true,
      materialRequests: true,
      payment: true,
      rating: true,
    },
  });

  await prisma.bookingStatusHistory.create({
    data: {
      bookingId,
      status: newStatus,
      note: note || `Status updated to ${newStatus}`,
    },
  });

  // Automatically generate invoice upon completion
  if (newStatus === "COMPLETED" && !booking.invoice) {
    try {
      await generateInvoice(bookingId);
    } catch (e) {
      console.error("Error auto-generating invoice:", e);
    }

    // Update worker totalJobs
    await prisma.worker.update({
      where: { id: booking.workerId },
      data: {
        totalJobs: { increment: 1 },
        lastAssignedAt: new Date(),
      },
    });
  }

  // Send status notifications
  const statusMessages: Record<string, { title: string; body: string }> = {
    ACCEPTED: {
      title: "Worker Accepted Your Booking",
      body: `${booking.worker.user.name} has accepted your ${booking.category.name} request.`,
    },
    TRAVELLING: {
      title: "Worker Is On The Way",
      body: `${booking.worker.user.name} is travelling to your location. ETA ~15 mins.`,
    },
    ARRIVED: {
      title: "Worker Has Arrived",
      body: `${booking.worker.user.name} has arrived at your address. Please provide your 4-digit security PIN: ${booking.servicePin}.`,
    },
    IN_PROGRESS: {
      title: "Work In Progress",
      body: `PIN verified! ${booking.worker.user.name} has started work on your ${booking.category.name}.`,
    },
    COMPLETED: {
      title: "Job Completed!",
      body: `Your ${booking.category.name} service is completed. Digital tax invoice is ready for payment.`,
    },
    CANCELLED: {
      title: "Booking Cancelled",
      body: `Booking #${booking.id.slice(0, 8)} has been cancelled. Reason: ${note || 'Cancelled'}`,
    },
  };

  const notifyMsg = statusMessages[newStatus];
  if (notifyMsg && booking.customer?.user?.id) {
    await sendNotification(
      booking.customer.user.id,
      "BOOKING",
      notifyMsg.title,
      notifyMsg.body,
      { bookingId, status: newStatus }
    );
  }

  return updated;
}

export async function verifyServicePin(bookingId: string, enteredPin: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");

  if (booking.servicePin === enteredPin) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { pinVerified: true, status: "IN_PROGRESS" },
    });

    await prisma.bookingStatusHistory.create({
      data: {
        bookingId,
        status: "IN_PROGRESS",
        note: "Service PIN verified by worker on-site",
      },
    });

    return { success: true, message: "PIN verified successfully. Job marked IN_PROGRESS." };
  }

  return { success: false, message: "Invalid PIN provided" };
}

export async function cancelBooking(bookingId: string, reason: string) {
  return updateBookingStatus(bookingId, "CANCELLED", reason);
}



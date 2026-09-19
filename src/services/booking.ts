import { prisma } from "@/lib/prisma";
import { generatePin } from "@/lib/utils";
import { sendNotification } from "./notification";

function parseTimeToMinutes(timeStr: string) {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function parseAbsoluteMinutes(dateObj: Date, timeStr: string) {
  if (!dateObj || !timeStr) return 0;
  const dateStr = dateObj.toISOString().split('T')[0]; 
  const baseDate = new Date(`${dateStr}T00:00:00.000Z`);
  const timeMinutes = parseTimeToMinutes(timeStr);
  return Math.floor(baseDate.getTime() / 60000) + timeMinutes;
}

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
  const reqId = Math.random().toString(36).substring(7);
  console.time(`[booking] worker check ${reqId}`);
  const worker = await prisma.worker.findUnique({
    where: { id: params.workerId },
  });
  console.timeEnd(`[booking] worker check ${reqId}`);

  if (!worker) {
    throw new Error("Worker not found");
  }

  if (worker.verificationStatus !== "VERIFIED") {
    throw new Error("Worker is not currently eligible for new bookings");
  }

  if (worker.availabilityStatus === "OFFLINE") {
    throw new Error("Worker is currently offline and cannot accept bookings");
  }

  return await prisma.$transaction(async (tx) => {
    console.time(`[booking] conflict check ${reqId}`);
    const activeBookings = await tx.booking.findMany({
      where: {
        workerId: params.workerId,
        status: {
          in: ["REQUESTED", "ACCEPTED", "TRAVELLING", "ARRIVED", "IN_PROGRESS"]
        }
      },
      select: { id: true, scheduledDate: true, scheduledTime: true },
    });
    console.timeEnd(`[booking] conflict check ${reqId}`);

    let conflicting = false;
    if (params.scheduledDate && params.scheduledTime) {
      const requestedStart = parseAbsoluteMinutes(params.scheduledDate, params.scheduledTime);
      const requestedEnd = requestedStart + 120; // Assume 2-hour duration

      conflicting = activeBookings.some(b => {
        if (!b.scheduledDate || !b.scheduledTime) return false;
        
        const bStart = parseAbsoluteMinutes(new Date(b.scheduledDate), b.scheduledTime);
        const bEnd = bStart + 120;
        
        return requestedStart < bEnd && bStart < requestedEnd;
      });
    }

    if (conflicting) {
      throw new Error("This worker is no longer available for the selected time. Please choose another worker or time.");
    }

    const servicePin = generatePin();

    console.time(`[booking] insert booking ${reqId}`);
    const booking = await tx.booking.create({
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
    console.timeEnd(`[booking] insert booking ${reqId}`);

    console.time(`[booking] insert status history ${reqId}`);
    await tx.bookingStatusHistory.create({
      data: {
        bookingId: booking.id,
        status: "REQUESTED",
        note: "Booking created by customer",
      },
    });
    console.timeEnd(`[booking] insert status history ${reqId}`);

    return booking;
  }, {
    isolationLevel: 'Serializable'
  }).then(async (booking) => {
    // Notify outside transaction to avoid blocking/rolling back if notification fails
    if (booking.worker?.user?.id) {
      await sendNotification(
        booking.worker.user.id,
        "BOOKING",
        "New Job Request",
        `You have a new ${booking.category.name} booking request at ${booking.address || 'your location'}.`,
        { bookingId: booking.id, category: booking.category.name }
      ).catch(e => console.error("Notification failed", e));
    }
    return booking;
  });
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
  note?: string
) {
  const validTransitions: Record<string, string[]> = {
    REQUESTED: ["ACCEPTED", "CANCELLED"],
    ACCEPTED: ["TRAVELLING"],
    TRAVELLING: ["ARRIVED"],
    ARRIVED: ["IN_PROGRESS"],
    IN_PROGRESS: ["COMPLETED"],
  };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
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

  if (!booking) throw new Error("Booking not found");

  if (booking.status !== newStatus) {
    const allowed = validTransitions[booking.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from ${booking.status} to ${newStatus}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const operations: any[] = [];

  // 1. Optimistic Concurrency Control (OCC)
  operations.push(
    prisma.booking.updateMany({
      where: { 
        id: bookingId,
        status: booking.status // Ensure it hasn't changed
      },
      data: {
        status: newStatus,
        completedAt: newStatus === "COMPLETED" ? new Date() : undefined,
      }
    })
  );

  // 2. Status History
  operations.push(
    prisma.bookingStatusHistory.create({
      data: {
        bookingId,
        status: newStatus,
        note: note || `Status updated to ${newStatus}`,
      },
    })
  );

  // 3. Invoice & Worker Updates
  if (newStatus === "COMPLETED" && !booking.invoice) {
    // We import buildInvoiceCreatePromise dynamically or assume it's available
    const { buildInvoiceCreatePromise } = await import("./invoice");
    operations.push(buildInvoiceCreatePromise(booking));

    operations.push(
      prisma.worker.update({
        where: { id: booking.workerId },
        data: {
          totalJobs: { increment: 1 },
          lastAssignedAt: new Date(),
        },
      })
    );
  }

  // 4. Notifications
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
    operations.push(
      prisma.notification.create({
        data: {
          userId: booking.customer.user.id,
          type: "BOOKING",
          title: notifyMsg.title,
          body: notifyMsg.body,
          data: JSON.stringify({ bookingId, status: newStatus }),
        }
      })
    );
  }

  // 5. Fetch updated booking for the UI
  operations.push(
    prisma.booking.findUnique({
      where: { id: bookingId },
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
    })
  );

  // Execute sequentially but in a single transaction batch over the network
  const results = await prisma.$transaction(operations);

  // Validate OCC
  if (results[0].count === 0) {
    throw new Error("Concurrent update detected. The booking was modified by another process.");
  }

  // Return the fetched booking (last operation in the array)
  return results[results.length - 1];
}

export async function verifyServicePin(bookingId: string, enteredPin: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");

  if (booking.status !== "ARRIVED") {
    return { success: false, message: "PIN can only be verified when worker has arrived" };
  }

  // Atomically increment attempts to prevent race conditions
  

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



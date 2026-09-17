const fs = require('fs');

let c = fs.readFileSync('src/services/booking.ts', 'utf8');

const startStr = 'export async function verifyServicePin';
const endStr = 'export async function cancelBooking';

const startIndex = c.indexOf(startStr);
const endIndex = c.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = `export async function verifyServicePin(bookingId: string, enteredPin: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");

  if (booking.status !== "ARRIVED") {
    return { success: false, message: "PIN can only be verified when worker has arrived" };
  }

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

  return { success: false, message: "Incorrect PIN." };
}

`;
  
  c = c.substring(0, startIndex) + replacement + c.substring(endIndex);
  fs.writeFileSync('src/services/booking.ts', c, 'utf8');
  console.log("Success");
} else {
  console.log("Not found");
}

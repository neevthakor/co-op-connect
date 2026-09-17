const fs = require('fs');

let c = fs.readFileSync('src/services/booking.ts', 'utf8');

const regex = /export async function verifyServicePin[\s\S]*?Invalid PIN provided"\s*;\n\s*\}/m;

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
}`;

if (regex.test(c)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/services/booking.ts', c, 'utf8');
  console.log("Success");
} else {
  console.log("Regex not found");
}

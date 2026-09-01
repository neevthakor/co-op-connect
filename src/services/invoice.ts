import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/utils";

export async function generateInvoice(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      category: true,
      materialRequests: {
        where: { status: "APPROVED" },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  const basePrice = booking.finalPrice || booking.estimatedPrice || booking.category.basePrice || 350;
  const labourCharge = Math.round(basePrice * 0.7);
  const travelCharge = Math.round(basePrice * 0.1);
  
  const materialCharge = booking.materialRequests.reduce(
    (sum, m) => sum + m.totalPrice,
    0
  );
  
  const additionalCharge = 0;
  const subtotal = labourCharge + travelCharge + materialCharge + additionalCharge;
  const cooperativeContribution = Math.round(subtotal * 0.05); // 5%
  const welfareContribution = Math.round(subtotal * 0.02); // 2%
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + tax;

  const invoice = await prisma.invoice.create({
    data: {
      bookingId,
      invoiceNumber: generateInvoiceNumber(),
      labourCharge,
      travelCharge,
      materialCharge,
      additionalCharge,
      cooperativeContribution,
      welfareContribution,
      subtotal,
      tax,
      total,
      status: "ISSUED",
      issuedAt: new Date(),
      items: {
        create: [
          { description: `${booking.category.name} Labour Charges`, amount: labourCharge, type: "LABOUR" },
          { description: "Travel & Logistics Allowance", amount: travelCharge, type: "TRAVEL" },
          ...(materialCharge > 0 ? [{ description: "Approved Replacement Materials", amount: materialCharge, type: "MATERIAL" }] : []),
          { description: "Cooperative Service Fund (5%)", amount: cooperativeContribution, type: "COOPERATIVE" },
          { description: "Worker Welfare Fund (2%)", amount: welfareContribution, type: "WELFARE" },
          { description: "Applicable Taxes (GST 5%)", amount: tax, type: "TAX" },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  return invoice;
}

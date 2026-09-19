import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/utils";

// Accept pre-fetched booking to eliminate redundant DB reads
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildInvoiceCreatePromise(booking: any) {
  const basePrice = booking.finalPrice || booking.estimatedPrice || booking.category.basePrice || 350;
  const labourCharge = Math.round(basePrice * 0.7);
  const travelCharge = Math.round(basePrice * 0.1);
  
  // Filter for APPROVED material requests if not already filtered
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const approvedMaterials = booking.materialRequests?.filter((m: any) => m.status === "APPROVED") || [];
  const materialCharge = approvedMaterials.reduce(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sum: number, m: any) => sum + m.totalPrice,
    0
  );
  
  const additionalCharge = 0;
  const subtotal = labourCharge + travelCharge + materialCharge + additionalCharge;
  const cooperativeContribution = Math.round(subtotal * 0.05); // 5%
  const welfareContribution = Math.round(subtotal * 0.02); // 2%
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + tax;

  return prisma.invoice.create({
    data: {
      bookingId: booking.id,
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
}

// Keep the old function signature for backward compatibility if used elsewhere
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

  return buildInvoiceCreatePromise(booking);
}

import { NextResponse } from "next/server";
import crypto from "crypto";
import { completePaymentTransaction } from "@/services/payment";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    
    if (!secret) {
      return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody);

    if (body.event === "payment.captured") {
      const paymentData = body.payload.payment.entity;
      
      // In a real implementation, you would store bookingId in notes when creating the order
      // We will assume notes.bookingId is passed
      const bookingId = paymentData.notes?.bookingId;
      const amount = paymentData.amount / 100; // convert from paise back to rupees
      const method = paymentData.method || "RAZORPAY";
      const transactionId = paymentData.id;

      if (!bookingId) {
        return NextResponse.json({ error: "Booking ID missing in notes" }, { status: 400 });
      }

      await completePaymentTransaction(bookingId, amount, method, "RAZORPAY", transactionId);

      return NextResponse.json({ success: true, message: "Payment processed" });
    }

    return NextResponse.json({ success: true, message: "Event ignored" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") },
      { status: 500 }
    );
  }
}

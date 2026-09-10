import { prisma } from "@/lib/prisma";

export async function sendNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      data: data ? JSON.stringify(data) : null,
    },
  });

  return notification;
}

export async function sendSMS(phone: string, message: string) {
  console.log(`[MOCK SMS] To: ${phone} -> Message: ${message}`);
  return { success: false, mode: "MOCK", message: 'SMS provider not configured' };
}

export async function sendEmail(email: string, subject: string, body: string) {
  console.log(`[MOCK EMAIL] To: ${email} -> Subject: ${subject} -> Body: ${body}`);
  return { success: false, mode: "MOCK", message: 'Email provider not configured' };
}

export async function markAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: {
      readAt: new Date(),
    },
  });
}

import prisma from './prisma';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'SUPPORT';
  link?: string;
  email?: string;
  phone?: string;
}

export async function sendNotification(payload: NotificationPayload) {
  try {
    // 1. Create In-App Notification in DB
    const notif = await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type || 'INFO',
        link: payload.link,
      },
    });

    // 2. Simulated External Dispatch Logging (Email & SMS)
    if (payload.email) {
      console.log(`[EMAIL DISPATCH] To: ${payload.email} | Subject: ${payload.title} | Body: ${payload.message}`);
    }
    if (payload.phone) {
      console.log(`[SMS DISPATCH] To: ${payload.phone} | Msg: ${payload.title}: ${payload.message}`);
    }

    return notif;
  } catch (err) {
    console.error('Failed to dispatch notification:', err);
    return null;
  }
}

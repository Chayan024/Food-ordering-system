import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const complaints = await prisma.complaint.findMany({
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        order: {
          include: {
            restaurant: { select: { name: true } },
            payment: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve complaints' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { complaintId, status, resolution } = body;

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: status || undefined,
        resolution: resolution || undefined,
      },
      include: {
        customer: true,
        order: true,
      },
    });

    // Notify customer
    await sendNotification({
      userId: updated.customerId,
      title: `Customer Support Update: Order #${updated.order.orderNumber}`,
      message: `Your complaint has been marked as ${status}. Resolution: ${resolution || 'Issue addressed.'}`,
      type: 'SUPPORT',
      link: `/orders/${updated.orderId}`,
      email: updated.customer.email,
    });

    return NextResponse.json({
      complaint: updated,
      message: 'Complaint resolved and customer notified',
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json(
      { error: 'Failed to update complaint' },
      { status: 500 }
    );
  }
}

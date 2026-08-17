import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { complaintSchema } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = complaintSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid complaint payload', details: result.error.format() },
        { status: 400 }
      );
    }

    const { orderId, subject, description } = result.data;

    const complaint = await prisma.complaint.create({
      data: {
        customerId: session.userId,
        orderId,
        subject,
        description,
        status: 'OPEN',
      },
    });

    return NextResponse.json(
      {
        complaint,
        message: 'Your ticket has been submitted. Our support team will review it shortly.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json(
      { error: 'Failed to submit support ticket' },
      { status: 500 }
    );
  }
}

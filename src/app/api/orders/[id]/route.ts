import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: true,
        orderItems: {
          include: { menuItem: true },
        },
        payment: true,
        delivery: {
          include: {
            deliveryPartner: {
              select: { id: true, name: true, phone: true, avatar: true },
            },
          },
        },
        reviews: true,
        complaints: true,
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Role permission check: Customer owner, Restaurant owner, Delivery partner, or Admin
    const isCustomer = order.customerId === session.userId;
    const isRestaurantStaff = order.restaurant.ownerId === session.userId;
    const isDeliveryPartner = order.deliveryPartnerId === session.userId;
    const isAdmin = session.role === 'ADMIN';

    if (!isCustomer && !isRestaurantStaff && !isDeliveryPartner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error retrieving order:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve order details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, action } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { delivery: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Customer can only cancel if still PENDING
    if (session.role === 'CUSTOMER') {
      if (action === 'CANCEL') {
        if (existingOrder.status !== 'PENDING') {
          return NextResponse.json(
            { error: 'Cannot cancel order once the kitchen has started preparing it' },
            { status: 400 }
          );
        }

        const updated = await prisma.order.update({
          where: { id },
          data: { status: 'CANCELLED' },
        });

        return NextResponse.json({ order: updated, message: 'Order cancelled successfully' });
      }
      return NextResponse.json({ error: 'Forbidden action' }, { status: 403 });
    }

    // Staff / Admin / Driver updating status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status || existingOrder.status,
      },
      include: {
        delivery: true,
        payment: true,
        restaurant: true,
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

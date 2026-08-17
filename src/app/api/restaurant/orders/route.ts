import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== 'RESTAURANT_STAFF' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find restaurant owned/managed by this staff
    const staffRestaurant = await prisma.restaurant.findFirst({
      where: session.role === 'ADMIN' ? {} : { ownerId: session.userId },
    });

    if (!staffRestaurant && session.role !== 'ADMIN') {
      return NextResponse.json({ orders: [], restaurant: null });
    }

    const where = staffRestaurant ? { restaurantId: staffRestaurant.id } : {};

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        orderItems: { include: { menuItem: true } },
        payment: true,
        delivery: { include: { deliveryPartner: { select: { id: true, name: true, phone: true } } } },
        restaurant: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      orders,
      restaurant: staffRestaurant,
    });
  } catch (error) {
    console.error('Error fetching restaurant orders:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve restaurant orders' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== 'RESTAURANT_STAFF' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, action } = body; // action: 'ACCEPT', 'PREPARE', 'READY', 'REJECT'

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, restaurant: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let newStatus = order.status;
    let message = '';

    if (action === 'ACCEPT') {
      newStatus = 'ACCEPTED';
      message = `${order.restaurant.name} has accepted your order #${order.orderNumber}! Kitchen will begin preparation shortly.`;
    } else if (action === 'PREPARE') {
      newStatus = 'PREPARING';
      message = `Your delicious food from ${order.restaurant.name} is now being prepared fresh in the kitchen. 👨‍🍳`;
    } else if (action === 'READY') {
      newStatus = 'READY_FOR_PICKUP';
      message = `Your order #${order.orderNumber} is freshly packed and ready for delivery partner pickup! 📦`;
    } else if (action === 'REJECT') {
      newStatus = 'CANCELLED';
      message = `We regret to inform you that ${order.restaurant.name} was unable to fulfill order #${order.orderNumber}. A full refund has been initiated.`;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      include: { orderItems: true, payment: true, delivery: true },
    });

    // Send customer notification
    await sendNotification({
      userId: order.customerId,
      title: `Order Update #${order.orderNumber}`,
      message,
      type: 'ORDER',
      link: `/orders/${order.id}`,
      email: order.customer.email,
      phone: order.customerPhone,
    });

    return NextResponse.json({
      order: updatedOrder,
      message: `Order status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error('Error updating kitchen order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

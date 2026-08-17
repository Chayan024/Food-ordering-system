import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== 'DELIVERY_PARTNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 1. Fetch available orders ready for pickup or unassigned
    const availableOrders = await prisma.order.findMany({
      where: {
        deliveryPartnerId: null,
        status: { in: ['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'] },
      },
      include: {
        restaurant: true,
        orderItems: true,
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 2. Fetch assigned active & past orders for this driver
    const myDeliveries = await prisma.order.findMany({
      where: {
        deliveryPartnerId: session.userId,
      },
      include: {
        restaurant: true,
        orderItems: true,
        payment: true,
        delivery: true,
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      availableOrders,
      myDeliveries,
    });
  } catch (error) {
    console.error('Error fetching driver delivery orders:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve delivery tasks' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== 'DELIVERY_PARTNER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { orderId, action, lat, lng } = body;
    // action: 'ASSIGN', 'ARRIVED_AT_STORE', 'PICKUP', 'DELIVER'

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, restaurant: true, delivery: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let orderStatus = order.status;
    let deliveryStatus = order.delivery?.deliveryStatus || 'UNASSIGNED';
    let pickupTime = order.delivery?.pickupTime;
    let deliveredTime = order.delivery?.deliveredTime;
    let notifMessage = '';

    if (action === 'ASSIGN') {
      deliveryStatus = 'ASSIGNED';
      notifMessage = `Delivery Partner ${session.name} has been assigned to pick up your order #${order.orderNumber}. 🛵`;
      
      await prisma.order.update({
        where: { id: orderId },
        data: {
          deliveryPartnerId: session.userId,
        },
      });
    } else if (action === 'ARRIVED_AT_STORE') {
      deliveryStatus = 'ARRIVED_AT_STORE';
      notifMessage = `Your driver has arrived at ${order.restaurant.name} and is waiting for your order to be packed.`;
    } else if (action === 'PICKUP') {
      orderStatus = 'OUT_FOR_DELIVERY';
      deliveryStatus = 'OUT_FOR_DELIVERY';
      pickupTime = new Date();
      notifMessage = `Good news! Your driver has picked up your fresh meal from ${order.restaurant.name} and is on the way to you! 🚀`;
    } else if (action === 'DELIVER') {
      orderStatus = 'DELIVERED';
      deliveryStatus = 'DELIVERED';
      deliveredTime = new Date();
      notifMessage = `Your order #${order.orderNumber} has been delivered successfully! Bon Appétit! 🎉 Please rate your experience.`;
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: orderStatus,
        deliveryPartnerId: session.userId,
      },
    });

    // Update or create delivery record
    await prisma.delivery.upsert({
      where: { orderId },
      create: {
        orderId,
        deliveryPartnerId: session.userId,
        deliveryStatus,
        pickupTime,
        deliveredTime,
        currentLat: lat || order.restaurant.lat,
        currentLng: lng || order.restaurant.lng,
      },
      update: {
        deliveryPartnerId: session.userId,
        deliveryStatus,
        pickupTime: pickupTime || undefined,
        deliveredTime: deliveredTime || undefined,
        currentLat: lat !== undefined ? lat : undefined,
        currentLng: lng !== undefined ? lng : undefined,
      },
    });

    if (notifMessage) {
      await sendNotification({
        userId: order.customerId,
        title: `Delivery Update #${order.orderNumber}`,
        message: notifMessage,
        type: 'DELIVERY',
        link: `/orders/${order.id}`,
        email: order.customer.email,
        phone: order.customerPhone,
      });
    }

    return NextResponse.json({
      message: `Delivery updated to ${deliveryStatus}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery status' },
      { status: 500 }
    );
  }
}

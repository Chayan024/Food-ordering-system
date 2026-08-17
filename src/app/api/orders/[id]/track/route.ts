import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { calculateDistance, calculateEstimatedDuration, generateRouteWaypoints } from '@/lib/maps';

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
        delivery: {
          include: {
            deliveryPartner: {
              select: { id: true, name: true, phone: true, avatar: true },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const restCoord = {
      lat: order.delivery?.restaurantLat || order.restaurant.lat,
      lng: order.delivery?.restaurantLng || order.restaurant.lng,
    };

    const custCoord = {
      lat: order.delivery?.customerLat || 28.6180,
      lng: order.delivery?.customerLng || 77.2150,
    };

    const distanceKm = calculateDistance(restCoord, custCoord);
    const etaMinutes = calculateEstimatedDuration(distanceKm);
    const routeWaypoints = generateRouteWaypoints(restCoord, custCoord, 8);

    // Calculate simulated driver current position based on order status
    let driverCoord = restCoord;
    if (order.status === 'OUT_FOR_DELIVERY') {
      // Halfway or progress-based
      driverCoord = routeWaypoints[Math.floor(routeWaypoints.length / 2)];
    } else if (order.status === 'DELIVERED') {
      driverCoord = custCoord;
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      restaurant: {
        name: order.restaurant.name,
        address: order.restaurant.address,
        coords: restCoord,
      },
      customer: {
        address: order.deliveryAddress,
        phone: order.customerPhone,
        coords: custCoord,
      },
      driver: order.delivery?.deliveryPartner || null,
      driverPosition: driverCoord,
      routeWaypoints,
      distanceKm,
      etaMinutes,
      deliveryStatus: order.delivery?.deliveryStatus || 'UNASSIGNED',
    });
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tracking information' },
      { status: 500 }
    );
  }
}

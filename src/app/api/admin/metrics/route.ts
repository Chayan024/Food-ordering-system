import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [
      totalUsers,
      totalRestaurants,
      totalOrders,
      orders,
      menuItems,
      complaints,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count(),
      prisma.order.count(),
      prisma.order.findMany({
        include: {
          orderItems: true,
          restaurant: { select: { name: true, cuisineType: true } },
        },
      }),
      prisma.menuItem.findMany({
        include: {
          _count: { select: { orderItems: true } },
          restaurant: { select: { name: true } },
        },
        orderBy: {
          orderItems: { _count: 'desc' },
        },
        take: 5,
      }),
      prisma.complaint.findMany({
        where: { status: 'OPEN' },
      }),
    ]);

    // Financial calculations
    const totalRevenue = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED').length;
    const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

    // Cuisine distribution
    const cuisineMap: { [key: string]: number } = {};
    orders.forEach((o) => {
      const cuisine = o.restaurant.cuisineType || 'Other';
      cuisineMap[cuisine] = (cuisineMap[cuisine] || 0) + 1;
    });

    const cuisineBreakdown = Object.keys(cuisineMap).map((name) => ({
      name,
      orders: cuisineMap[name],
    }));

    // Status breakdown
    const statusCounts: { [key: string]: number } = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    return NextResponse.json({
      metrics: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        totalUsers,
        totalRestaurants,
        openComplaints: complaints.length,
        cancellationRate: parseFloat(cancellationRate.toFixed(1)),
      },
      topDishes: menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        restaurant: item.restaurant.name,
        price: item.price,
        orderCount: item._count.orderItems,
      })),
      cuisineBreakdown,
      statusCounts,
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve admin analytics' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const restaurants = await prisma.restaurant.findMany({
      include: {
        owner: { select: { name: true, email: true } },
        _count: { select: { menuItems: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ restaurants });
  } catch (error) {
    console.error('Error fetching admin restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve restaurants' },
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
    const { restaurantId, isOpen, name, cuisineType, deliveryFee, minOrder } = body;

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        isOpen: isOpen !== undefined ? Boolean(isOpen) : undefined,
        name: name || undefined,
        cuisineType: cuisineType || undefined,
        deliveryFee: deliveryFee !== undefined ? parseFloat(deliveryFee) : undefined,
        minOrder: minOrder !== undefined ? parseFloat(minOrder) : undefined,
      },
    });

    return NextResponse.json({
      restaurant: updated,
      message: 'Restaurant profile updated successfully',
    });
  } catch (error) {
    console.error('Error updating restaurant from admin:', error);
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
      { status: 500 }
    );
  }
}

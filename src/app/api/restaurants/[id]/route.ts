import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuItems: {
          orderBy: { category: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: { name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // Group menu items by category
    const categoriesMap: { [key: string]: typeof restaurant.menuItems } = {};
    restaurant.menuItems.forEach((item) => {
      if (!categoriesMap[item.category]) {
        categoriesMap[item.category] = [];
      }
      categoriesMap[item.category].push(item);
    });

    const categorizedMenu = Object.keys(categoriesMap).map((cat) => ({
      category: cat,
      items: categoriesMap[cat],
    }));

    return NextResponse.json({
      restaurant,
      categorizedMenu,
    });
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve restaurant details' },
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
    if (!session || (session.role !== 'ADMIN' && session.role !== 'RESTAURANT_STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.restaurant.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        address: body.address,
        cuisineType: body.cuisineType,
        isOpen: body.isOpen !== undefined ? Boolean(body.isOpen) : undefined,
        deliveryFee: body.deliveryFee !== undefined ? parseFloat(body.deliveryFee) : undefined,
        minOrder: body.minOrder !== undefined ? parseFloat(body.minOrder) : undefined,
        deliveryTime: body.deliveryTime,
      },
    });

    return NextResponse.json({ restaurant: updated });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to update restaurant profile' },
      { status: 500 }
    );
  }
}

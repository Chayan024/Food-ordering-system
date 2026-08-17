import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { menuItemSchema } from '@/lib/validation';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'RESTAURANT_STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id: restaurantId } = await params;
    const body = await req.json();
    const result = menuItemSchema.safeParse({ ...body, restaurantId });

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const item = await prisma.menuItem.create({
      data: {
        restaurantId,
        name: result.data.name,
        description: result.data.description,
        price: result.data.price,
        category: result.data.category,
        imageUrl: result.data.imageUrl,
        isVeg: result.data.isVeg,
        isAvailable: result.data.isAvailable,
        calories: result.data.calories,
        prepTime: result.data.prepTime,
      },
    });

    return NextResponse.json({ menuItem: item }, { status: 201 });
  } catch (error) {
    console.error('Error adding menu item:', error);
    return NextResponse.json(
      { error: 'Failed to add menu item' },
      { status: 500 }
    );
  }
}

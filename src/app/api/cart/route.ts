import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { cartItemSchema } from '@/lib/validation';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ items: [], subtotal: 0, count: 0 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: {
        menuItem: {
          include: {
            restaurant: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.menuItem.price * item.quantity,
      0
    );

    const count = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const restaurant = cartItems.length > 0 ? cartItems[0].menuItem.restaurant : null;

    return NextResponse.json({
      items: cartItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      count,
      restaurant,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart items' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: 'Please log in to add items to your cart' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = cartItemSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid cart payload', details: result.error.format() },
        { status: 400 }
      );
    }

    const { menuItemId, quantity, specialNotes } = result.data;
    const forceReplace = body.forceReplace === true;

    // Check menu item exists
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { restaurant: true },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Check if cart has items from another restaurant
    const existingCart = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: { menuItem: true },
    });

    if (existingCart.length > 0) {
      const existingRestId = existingCart[0].menuItem.restaurantId;
      if (existingRestId !== menuItem.restaurantId) {
        if (!forceReplace) {
          return NextResponse.json(
            {
              error: 'DIFFERENT_RESTAURANT',
              message:
                'Your cart contains items from a different restaurant. Would you like to clear your cart and add this item?',
            },
            { status: 409 }
          );
        } else {
          // Clear current cart first
          await prisma.cartItem.deleteMany({
            where: { userId: session.userId },
          });
        }
      }
    }

    // Upsert item
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.userId,
        menuItemId,
      },
    });

    if (existingItem) {
      if (quantity <= 0) {
        await prisma.cartItem.delete({
          where: { id: existingItem.id },
        });
      } else {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity,
            specialNotes: specialNotes !== undefined ? specialNotes : existingItem.specialNotes,
          },
        });
      }
    } else if (quantity > 0) {
      await prisma.cartItem.create({
        data: {
          userId: session.userId,
          menuItemId,
          quantity,
          specialNotes,
        },
      });
    }

    return NextResponse.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const clear = searchParams.get('clear') === 'true';
    const itemId = searchParams.get('itemId');

    if (clear) {
      await prisma.cartItem.deleteMany({
        where: { userId: session.userId },
      });
      return NextResponse.json({ message: 'Cart cleared' });
    }

    if (itemId) {
      await prisma.cartItem.delete({
        where: { id: itemId, userId: session.userId },
      });
      return NextResponse.json({ message: 'Item removed from cart' });
    }

    return NextResponse.json({ error: 'No item specified' }, { status: 400 });
  } catch (error) {
    console.error('Error deleting from cart:', error);
    return NextResponse.json(
      { error: 'Failed to delete from cart' },
      { status: 500 }
    );
  }
}

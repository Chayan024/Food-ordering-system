import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validation';
import { processPayment } from '@/lib/payment-gateway';
import { sendNotification } from '@/lib/notifications';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { customerId: session.userId },
      include: {
        restaurant: true,
        orderItems: true,
        payment: true,
        delivery: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json(
        { error: 'Please log in to complete checkout' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid checkout information', details: result.error.format() },
        { status: 400 }
      );
    }

    const {
      restaurantId,
      deliveryAddress,
      customerPhone,
      paymentMethod,
      couponCode,
      specialInstructions,
      cardNumber,
      cardExpiry,
      cardCvv,
      upiId,
    } = result.data;

    // 1. Fetch Cart items for user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.userId },
      include: {
        menuItem: true,
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty. Please add items before checking out.' },
        { status: 400 }
      );
    }

    // 2. Fetch Restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    // 3. Compute Financial Totals
    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.menuItem.price * item.quantity,
      0
    );

    if (subtotal < restaurant.minOrder) {
      return NextResponse.json(
        {
          error: `Minimum order amount for ${restaurant.name} is $${restaurant.minOrder.toFixed(
            2
          )}`,
        },
        { status: 400 }
      );
    }

    const tax = parseFloat((subtotal * 0.05).toFixed(2)); // 5% GST/Tax
    const deliveryFee = restaurant.deliveryFee;
    let discount = 0;

    // 4. Coupon Verification
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive && new Date() <= coupon.validUntil) {
        if (subtotal >= coupon.minOrderValue) {
          const rawDiscount = (subtotal * coupon.discountPercent) / 100;
          discount = parseFloat(Math.min(rawDiscount, coupon.maxDiscount).toFixed(2));

          // Increment coupon usage count
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: { increment: 1 } },
          });
        }
      }
    }

    const totalAmount = parseFloat(
      Math.max(0, subtotal + tax + deliveryFee - discount).toFixed(2)
    );

    // 5. Process Payment via Gateway Simulator
    const paymentResult = await processPayment({
      orderId: `TEMP_${Date.now()}`,
      amount: totalAmount,
      method: paymentMethod,
      cardNumber,
      cardExpiry,
      cardCvv,
      upiId,
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        {
          error: paymentResult.message,
          errorCode: paymentResult.gatewayResponse.errorCode,
        },
        { status: 402 } // Payment Required / Failed
      );
    }

    // 6. Generate Unique Order ID
    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    // 7. Atomic DB Transaction to create Order, OrderItems, Payment, and Delivery
    const newOrder = await prisma.$transaction(async (tx) => {
      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: session.userId,
          restaurantId,
          status: 'PENDING',
          subtotal: parseFloat(subtotal.toFixed(2)),
          tax,
          deliveryFee,
          discount,
          totalAmount,
          deliveryAddress,
          customerPhone,
          specialInstructions,
          orderItems: {
            create: cartItems.map((item) => ({
              menuItemId: item.menuItemId,
              name: item.menuItem.name,
              price: item.menuItem.price,
              quantity: item.quantity,
            })),
          },
          payment: {
            create: {
              method: paymentMethod,
              status: paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
              transactionId: paymentResult.transactionId,
              amount: totalAmount,
              gatewayResponse: JSON.stringify(paymentResult.gatewayResponse),
            },
          },
          delivery: {
            create: {
              deliveryStatus: 'UNASSIGNED',
              restaurantLat: restaurant.lat,
              restaurantLng: restaurant.lng,
              customerLat: restaurant.lat + (Math.random() - 0.5) * 0.02,
              customerLng: restaurant.lng + (Math.random() - 0.5) * 0.02,
              estimatedDeliveryTime: new Date(Date.now() + 35 * 60 * 1000),
            },
          },
        },
        include: {
          orderItems: true,
          payment: true,
          delivery: true,
          restaurant: true,
        },
      });

      // Clear user cart
      await tx.cartItem.deleteMany({
        where: { userId: session.userId },
      });

      return order;
    });

    // 8. Dispatch Real-Time Notifications
    await sendNotification({
      userId: session.userId,
      title: 'Order Placed Successfully! 🎉',
      message: `Your order #${newOrder.orderNumber} from ${restaurant.name} has been placed. Total: $${totalAmount.toFixed(2)}.`,
      type: 'ORDER',
      link: `/orders/${newOrder.id}`,
      email: session.email,
      phone: customerPhone,
    });

    // Notify restaurant owner if exists
    if (restaurant.ownerId) {
      await sendNotification({
        userId: restaurant.ownerId,
        title: 'New Order Received! 🔔',
        message: `Order #${newOrder.orderNumber} placed for ${cartItems.length} items.`,
        type: 'ORDER',
        link: `/restaurant/dashboard`,
      });
    }

    return NextResponse.json(
      {
        message: 'Order placed successfully',
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        totalAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to complete order. Please try again.' },
      { status: 500 }
    );
  }
}

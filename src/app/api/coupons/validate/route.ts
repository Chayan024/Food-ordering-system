import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive coupon code' },
        { status: 404 }
      );
    }

    if (new Date() > coupon.validUntil) {
      return NextResponse.json(
        { error: 'This coupon code has expired' },
        { status: 400 }
      );
    }

    const orderSubtotal = parseFloat(subtotal) || 0;
    if (orderSubtotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          error: `Minimum order amount of $${coupon.minOrderValue.toFixed(
            2
          )} required for coupon ${coupon.code}`,
        },
        { status: 400 }
      );
    }

    // Calculate discount
    const calculated = (orderSubtotal * coupon.discountPercent) / 100;
    const discountAmount = Math.min(calculated, coupon.maxDiscount);

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountPercent: coupon.discountPercent,
        maxDiscount: coupon.maxDiscount,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}

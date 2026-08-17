import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        restaurant: { select: { name: true } },
        payment: true,
        orderItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV rows
    const headers = [
      'Order Number',
      'Date',
      'Customer',
      'Email',
      'Restaurant',
      'Items Count',
      'Subtotal ($)',
      'Tax ($)',
      'Delivery Fee ($)',
      'Discount ($)',
      'Total Amount ($)',
      'Payment Method',
      'Payment Status',
      'Order Status',
    ];

    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toISOString().split('T')[0],
      `"${o.customer.name.replace(/"/g, '""')}"`,
      o.customer.email,
      `"${o.restaurant.name.replace(/"/g, '""')}"`,
      o.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      o.subtotal.toFixed(2),
      o.tax.toFixed(2),
      o.deliveryFee.toFixed(2),
      o.discount.toFixed(2),
      o.totalAmount.toFixed(2),
      o.payment?.method || 'N/A',
      o.payment?.status || 'N/A',
      o.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="food_delivery_orders_export_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV export:', error);
    return NextResponse.json(
      { error: 'Failed to export reports' },
      { status: 500 }
    );
  }
}

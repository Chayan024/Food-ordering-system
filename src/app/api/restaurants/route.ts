import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const cuisine = searchParams.get('cuisine') || '';
    const minRating = parseFloat(searchParams.get('rating') || '0');
    const vegOnly = searchParams.get('veg') === 'true';
    const sortBy = searchParams.get('sort') || 'recommended'; // 'recommended', 'rating', 'deliveryTime', 'minOrder'

    // Build filter conditions
    const where: any = {
      isOpen: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { cuisineType: { contains: search } },
        { description: { contains: search } },
        { menuItems: { some: { name: { contains: search } } } },
      ];
    }

    if (cuisine && cuisine !== 'All') {
      where.cuisineType = { contains: cuisine };
    }

    if (minRating > 0) {
      where.rating = { gte: minRating };
    }

    if (vegOnly) {
      where.menuItems = {
        some: { isVeg: true },
      };
    }

    // Determine order
    let orderBy: any = { rating: 'desc' };
    if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'minOrder') {
      orderBy = { minOrder: 'asc' };
    } else if (sortBy === 'deliveryFee') {
      orderBy = { deliveryFee: 'asc' };
    }

    const restaurants = await prisma.restaurant.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: { menuItems: true, reviews: true },
        },
      },
    });

    return NextResponse.json({ restaurants });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve restaurants' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'RESTAURANT_STAFF')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const restaurant = await prisma.restaurant.create({
      data: {
        name: body.name,
        description: body.description,
        address: body.address,
        city: body.city || 'Metropolis',
        cuisineType: body.cuisineType,
        image: body.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600',
        bannerImage: body.bannerImage,
        deliveryFee: parseFloat(body.deliveryFee || '3.99'),
        minOrder: parseFloat(body.minOrder || '15.0'),
        deliveryTime: body.deliveryTime || '25-35 mins',
        lat: body.lat ? parseFloat(body.lat) : 28.6139,
        lng: body.lng ? parseFloat(body.lng) : 77.2090,
        ownerId: session.userId,
      },
    });

    return NextResponse.json({ restaurant }, { status: 201 });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json(
      { error: 'Failed to create restaurant' },
      { status: 500 }
    );
  }
}

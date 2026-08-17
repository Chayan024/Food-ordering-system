import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { reviewSchema } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid review data', details: result.error.format() },
        { status: 400 }
      );
    }

    const { restaurantId, orderId, rating, comment } = result.data;

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.userId,
        restaurantId,
        orderId,
        rating,
        comment,
      },
    });

    // Update restaurant average rating
    const allReviews = await prisma.review.findMany({
      where: { restaurantId },
      select: { rating: true },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        ratingCount: allReviews.length,
      },
    });

    return NextResponse.json(
      { review, message: 'Thank you for your review!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getCurrentUserFromDb } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUserFromDb();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

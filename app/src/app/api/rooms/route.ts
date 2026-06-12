import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { roomRepository } from '@/repositories/server';

/**
 * GET /api/rooms
 *
 * Returns all rooms for the authenticated owner's property,
 * including tenant info and current billing status.
 *
 * Used by: Rooms page, Room detail, Move-in/out selector, Generate Bills.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await roomRepository.listRooms();
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

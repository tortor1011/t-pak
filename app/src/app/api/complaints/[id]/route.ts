import { NextResponse } from 'next/server';
import { complaintsRepository } from '@/repositories/server';
import { getNextComplaintStatus } from '@/services/complaintQueue';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Use specific status if provided, otherwise assume we want to advance the status
    if (status) {
      const result = await complaintsRepository.updateComplaintStatus(id, status);
      if (result.ok) {
        return NextResponse.json(result.value);
      }
      return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Status is required' }, { status: 400 });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

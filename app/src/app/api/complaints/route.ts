import { NextResponse } from 'next/server';
import { complaintsRepository } from '@/repositories/server';

export async function GET() {
  try {
    const result = await complaintsRepository.listComplaints();
    if (result.ok) {
      return NextResponse.json(result.value);
    }
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

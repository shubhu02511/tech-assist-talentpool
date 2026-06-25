import { NextResponse } from 'next/server';
import { getCandidates } from '@/lib/db';

export async function GET() {
  try {
    const candidates = await getCandidates();
    return NextResponse.json({ candidates });
  } catch (error: any) {
    console.error('Candidates API GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch candidates.' },
      { status: 500 }
    );
  }
}

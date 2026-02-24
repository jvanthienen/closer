import { NextResponse } from 'next/server';
import { createConnection } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { connectedUserId } = await request.json();

    if (!connectedUserId) {
      return NextResponse.json(
        { error: 'connectedUserId is required' },
        { status: 400 }
      );
    }

    await createConnection(connectedUserId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating connection:', error);

    // Check for duplicate connection
    if (error.message?.includes('duplicate')) {
      return NextResponse.json(
        { error: 'Connection already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create connection' },
      { status: 500 }
    );
  }
}

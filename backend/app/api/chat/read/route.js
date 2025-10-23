import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Message from '../../../../models/Message';
import { verifyToken } from '../../../../lib/auth';

// PATCH - Mark messages as read
export async function PATCH(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const { searchParams } = new URL(request.url);
    const fromUserId = searchParams.get('from');

    await connectDB();

    // Mark all unread messages from a specific user as read
    const result = await Message.updateMany(
      {
        from: fromUserId,
        to: userId,
        read: false,
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      { message: 'Messages marked as read', count: result.modifiedCount },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}

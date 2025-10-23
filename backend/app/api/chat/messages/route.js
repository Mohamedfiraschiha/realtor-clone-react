import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Message from '../../../../models/Message';
import { verifyToken } from '../../../../lib/auth';

// GET - Get conversation between two users
export async function GET(request) {
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
    const otherUserId = searchParams.get('userId');
    const listingId = searchParams.get('listingId');

    await connectDB();

    let query = {
      $or: [
        { from: userId, to: otherUserId },
        { from: otherUserId, to: userId },
      ],
    };

    if (listingId) {
      query.listingId = listingId;
    }

    const messages = await Message.find(query)
      .populate('from', 'fullName email')
      .populate('to', 'fullName email')
      .sort({ createdAt: 1 });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Save a new message
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { to, message, listingId, listingName } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Recipient and message are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const newMessage = await Message.create({
      from: decoded.userId,
      to,
      message,
      listingId,
      listingName,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('from', 'fullName email')
      .populate('to', 'fullName email');

    return NextResponse.json(
      { message: populatedMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}

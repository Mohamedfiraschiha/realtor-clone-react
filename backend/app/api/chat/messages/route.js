import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { createMessage, findMessages } from "../../../../models/Message";
import { verifyToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";
import { withCORS } from "../../../../lib/cors";

// GET - Get conversation between two users
async function handleGET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.userId;
    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get("userId");
    const listingId = searchParams.get("listingId");

    if (!otherUserId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    let query = {
      $or: [
        { from: new ObjectId(userId), to: new ObjectId(otherUserId) },
        { from: new ObjectId(otherUserId), to: new ObjectId(userId) },
      ],
    };

    if (listingId) {
      query.listingId = new ObjectId(listingId);
    }

    const messages = await findMessages(client, query, {
      sort: { createdAt: 1 },
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Save a new message
async function handlePOST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { to, message, listingId, listingName } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: "Recipient and message are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    const newMessage = await createMessage(client, {
      from: decoded.userId,
      to,
      message,
      listingId,
      listingName,
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}

export const GET = withCORS(handleGET);
export const POST = withCORS(handlePOST);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 }));

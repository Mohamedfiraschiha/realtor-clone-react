import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { updateMessages } from "../../../../models/Message";
import { verifyToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";
import { withCORS } from "../../../../lib/cors";

// PATCH - Mark messages as read
async function handlePATCH(request) {
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
    const fromUserId = searchParams.get("from");

    if (!fromUserId) {
      return NextResponse.json(
        { error: "from parameter is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;

    // Mark all unread messages from a specific user as read
    const result = await updateMessages(
      client,
      {
        from: new ObjectId(fromUserId),
        to: new ObjectId(userId),
        read: false,
      },
      {
        $set: {
          read: true,
          readAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      { message: "Messages marked as read", count: result.modifiedCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}

export const PATCH = withCORS(handlePATCH);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 }));

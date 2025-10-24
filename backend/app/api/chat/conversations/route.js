import { NextResponse } from "next/server";
import clientPromise from "../../../../lib/mongodb";
import { getConversations } from "../../../../models/Message";
import { verifyToken } from "../../../../lib/auth";
import { withCORS } from "../../../../lib/cors";

// GET - Get all conversations for a user
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
    const client = await clientPromise;

    const conversations = await getConversations(client, userId);

    // Get user details for each conversation
    const db = client.db(); // Use default database from connection string
    const usersCollection = db.collection("users");

    const conversationsWithUserDetails = await Promise.all(
      conversations.map(async (conv) => {
        const user = await usersCollection.findOne({ _id: conv._id });
        return {
          userId: conv._id,
          fullName: user?.fullName || user?.email || "Unknown User",
          email: user?.email,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
        };
      })
    );

    return NextResponse.json(
      { conversations: conversationsWithUserDetails },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export const GET = withCORS(handleGET);
export const OPTIONS = withCORS(() => new Response(null, { status: 204 }));

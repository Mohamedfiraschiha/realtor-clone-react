import { verifyToken } from "../../../lib/auth.js";
import { NextResponse } from "next/server";
import {
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} from "../../../models/Notification.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET - Fetch user notifications
export async function GET(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: corsHeaders }
      );
    }

    const decoded = verifyToken(token);

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit")) || 50;

    console.log('Fetching notifications for userId:', decoded.userId, 'unreadOnly:', unreadOnly);

    const notifications = await getNotifications(decoded.userId, {
      unreadOnly,
      limit,
    });

    const unreadCount = await getUnreadCount(decoded.userId);

    console.log('Found notifications:', notifications.length, 'unread:', unreadCount);

    return NextResponse.json(
      { notifications, unreadCount },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch notifications" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST - Create a new notification
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      recipientId,
      senderId,
      type,
      title,
      message,
      listingId,
      listingName,
      metadata,
      actionUrl,
    } = body;

    if (!recipientId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400, headers: corsHeaders }
      );
    }

    const notification = await createNotification({
      recipientId,
      senderId,
      type,
      title,
      message,
      listingId,
      listingName,
      metadata,
      actionUrl,
    });

    return NextResponse.json(
      { message: "Notification created", notification },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create notification" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PATCH - Mark notifications as read
export async function PATCH(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: corsHeaders }
      );
    }

    const decoded = verifyToken(token);

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");
    const shouldMarkAllAsRead = searchParams.get("markAllAsRead") === "true";

    if (shouldMarkAllAsRead) {
      // Mark all notifications as read for this user
      const count = await markAllAsRead(decoded.userId);

      return NextResponse.json(
        { message: `${count} notifications marked as read` },
        { headers: corsHeaders }
      );
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const success = await markAsRead(notificationId, decoded.userId);

    if (!success) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: "Notification marked as read" },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update notification" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE - Delete a notification
export async function DELETE(req) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: corsHeaders }
      );
    }

    const decoded = verifyToken(token);

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");
    const shouldDeleteAll = searchParams.get("deleteAll") === "true";

    if (shouldDeleteAll) {
      // Delete all read notifications for this user
      const count = await deleteAllRead(decoded.userId);

      return NextResponse.json(
        { message: `${count} read notifications deleted` },
        { headers: corsHeaders }
      );
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const success = await deleteNotification(notificationId, decoded.userId);

    if (!success) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: "Notification deleted" },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete notification" },
      { status: 500, headers: corsHeaders }
    );
  }
}

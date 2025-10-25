import clientPromise from '../lib/mongodb.js';
import { ObjectId } from 'mongodb';

/**
 * Create a notification
 */
export async function createNotification({
  recipientId,
  senderId = null,
  type,
  title,
  message,
  listingId = null,
  listingName = null,
  metadata = {},
  actionUrl = null,
  isRead = false,
}) {
  const client = await clientPromise;
  const db = client.db();
  
  // Ensure IDs are strings for consistent querying
  const recipientIdStr = typeof recipientId === 'string' ? recipientId : recipientId.toString();
  const senderIdStr = senderId ? (typeof senderId === 'string' ? senderId : senderId.toString()) : null;
  
  console.log('Creating notification - recipientId:', recipientIdStr, 'type:', typeof recipientIdStr);
  
  const notification = {
    recipientId: recipientIdStr,
    senderId: senderIdStr,
    type,
    title,
    message,
    listingId,
    listingName,
    metadata,
    actionUrl,
    isRead,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('notifications').insertOne(notification);
  return { _id: result.insertedId, ...notification };
}

/**
 * Get notifications for a user
 */
export async function getNotifications(recipientId, options = {}) {
  const client = await clientPromise;
  const db = client.db();
  
  // Ensure recipientId is a string for consistent querying
  const recipientIdStr = typeof recipientId === 'string' ? recipientId : recipientId.toString();
  
  console.log('Getting notifications - recipientId:', recipientIdStr, 'type:', typeof recipientIdStr);
  
  const query = { recipientId: recipientIdStr };
  if (options.unreadOnly) {
    query.isRead = false;
  }

  const notifications = await db
    .collection('notifications')
    .find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .toArray();

  console.log('Query result:', notifications.length, 'notifications found');
  if (notifications.length > 0) {
    console.log('Sample notification recipientId:', notifications[0].recipientId, 'type:', typeof notifications[0].recipientId);
  }

  return notifications;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(recipientId) {
  const client = await clientPromise;
  const db = client.db();
  
  // Ensure recipientId is a string for consistent querying
  const recipientIdStr = typeof recipientId === 'string' ? recipientId : recipientId.toString();
  
  const count = await db.collection('notifications').countDocuments({
    recipientId: recipientIdStr,
    isRead: false,
  });

  return count;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId, recipientId) {
  const client = await clientPromise;
  const db = client.db();
  
  const result = await db.collection('notifications').updateOne(
    { _id: new ObjectId(notificationId), recipientId },
    { $set: { isRead: true, updatedAt: new Date() } }
  );

  return result.modifiedCount > 0;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(recipientId) {
  const client = await clientPromise;
  const db = client.db();
  
  const result = await db.collection('notifications').updateMany(
    { recipientId, isRead: false },
    { $set: { isRead: true, updatedAt: new Date() } }
  );

  return result.modifiedCount;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId, recipientId) {
  const client = await clientPromise;
  const db = client.db();
  
  const result = await db.collection('notifications').deleteOne({
    _id: new ObjectId(notificationId),
    recipientId,
  });

  return result.deletedCount > 0;
}

/**
 * Delete all read notifications
 */
export async function deleteAllRead(recipientId) {
  const client = await clientPromise;
  const db = client.db();
  
  const result = await db.collection('notifications').deleteMany({
    recipientId,
    isRead: true,
  });

  return result.deletedCount;
}

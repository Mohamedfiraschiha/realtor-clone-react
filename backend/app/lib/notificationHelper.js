import Notification from "../models/Notification";

/**
 * Create a notification
 * @param {Object} params - Notification parameters
 * @param {String} params.recipientId - User ID who will receive the notification
 * @param {String} params.senderId - User ID who triggered the notification (optional)
 * @param {String} params.type - Type of notification
 * @param {String} params.title - Notification title
 * @param {String} params.message - Notification message
 * @param {String} params.listingId - Related listing ID (optional)
 * @param {String} params.listingName - Related listing name (optional)
 * @param {Object} params.metadata - Additional metadata (optional)
 * @param {String} params.actionUrl - URL to navigate when clicked (optional)
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
}) {
  try {
    const notification = await Notification.create({
      recipientId,
      senderId,
      type,
      title,
      message,
      listingId,
      listingName,
      metadata,
      actionUrl,
      isRead: false,
    });
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Notification templates for different events
export const NotificationTemplates = {
  favorite: (senderName, listingName) => ({
    type: "favorite",
    title: "❤️ New Favorite",
    message: `${senderName} added your property "${listingName}" to their favorites`,
  }),

  interested: (senderName, listingName) => ({
    type: "interested",
    title: "👍 Someone is Interested",
    message: `${senderName} is interested in "${listingName}"`,
  }),

  visitRequest: (senderName, listingName, date) => ({
    type: "visit_request",
    title: "📅 New Visit Request",
    message: `${senderName} requested to visit "${listingName}" on ${date}`,
  }),

  visitApproved: (ownerName, listingName, date) => ({
    type: "visit_approved",
    title: "✅ Visit Request Approved",
    message: `Your visit request for "${listingName}" on ${date} has been approved`,
  }),

  visitRejected: (ownerName, listingName) => ({
    type: "visit_rejected",
    title: "❌ Visit Request Declined",
    message: `Your visit request for "${listingName}" has been declined`,
  }),

  offerReceived: (senderName, listingName, amount) => ({
    type: "offer_received",
    title: "🤝 New Offer Received",
    message: `${senderName} made an offer of ${amount.toLocaleString()} TND for "${listingName}"`,
  }),

  offerAccepted: (ownerName, listingName) => ({
    type: "offer_accepted",
    title: "🎉 Offer Accepted",
    message: `Your offer for "${listingName}" has been accepted!`,
  }),

  offerRejected: (ownerName, listingName) => ({
    type: "offer_rejected",
    title: "❌ Offer Declined",
    message: `Your offer for "${listingName}" has been declined`,
  }),

  offerCountered: (ownerName, listingName, amount) => ({
    type: "offer_countered",
    title: "🔄 Counter Offer",
    message: `${ownerName} countered your offer with ${amount.toLocaleString()} TND for "${listingName}"`,
  }),

  applicationReceived: (senderName, listingName) => ({
    type: "application_received",
    title: "📝 New Rental Application",
    message: `${senderName} submitted a rental application for "${listingName}"`,
  }),

  applicationApproved: (ownerName, listingName) => ({
    type: "application_approved",
    title: "✅ Application Approved",
    message: `Your rental application for "${listingName}" has been approved!`,
  }),

  applicationRejected: (ownerName, listingName) => ({
    type: "application_rejected",
    title: "❌ Application Declined",
    message: `Your rental application for "${listingName}" has been declined`,
  }),
};

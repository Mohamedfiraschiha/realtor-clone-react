import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: String,
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "favorite",
        "visit_request",
        "visit_approved",
        "visit_rejected",
        "offer_received",
        "offer_accepted",
        "offer_rejected",
        "offer_countered",
        "application_received",
        "application_approved",
        "application_rejected",
        "interested",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    listingId: {
      type: String,
      default: null,
    },
    listingName: {
      type: String,
      default: null,
    },
    metadata: {
      type: Object,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;

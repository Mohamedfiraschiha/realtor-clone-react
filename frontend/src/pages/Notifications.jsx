import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBell,
  FaHeart,
  FaCalendarCheck,
  FaHandshake,
  FaFileContract,
  FaThumbsUp,
  FaCheckCircle,
  FaTimesCircle,
  FaExchangeAlt,
  FaTrash,
  FaCheckDouble,
} from "react-icons/fa";
import Spinner from "../Components/Spinner";

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all"); // all, unread

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/sign-in");
      return;
    }
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, filter]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = `/api/notifications${
        filter === "unread" ? "?unreadOnly=true" : ""
      }`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch notifications");

      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/notifications?id=${notificationId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to mark as read");

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/notifications?markAllAsRead=true`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to mark all as read");

      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/notifications?id=${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete notification");

      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const getIcon = (type) => {
    const iconMap = {
      favorite: <FaHeart className="text-red-500" />,
      interested: <FaThumbsUp className="text-blue-500" />,
      visit_request: <FaCalendarCheck className="text-blue-600" />,
      visit_approved: <FaCheckCircle className="text-green-600" />,
      visit_rejected: <FaTimesCircle className="text-red-600" />,
      offer_received: <FaHandshake className="text-green-600" />,
      offer_accepted: <FaCheckCircle className="text-green-600" />,
      offer_rejected: <FaTimesCircle className="text-red-600" />,
      offer_countered: <FaExchangeAlt className="text-yellow-600" />,
      application_received: <FaFileContract className="text-purple-600" />,
      application_approved: <FaCheckCircle className="text-green-600" />,
      application_rejected: <FaTimesCircle className="text-red-600" />,
    };
    return iconMap[type] || <FaBell className="text-gray-500" />;
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000); // seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 p-3 rounded-full">
                <FaBell className="text-2xl text-slate-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Notifications
                </h1>
                <p className="text-gray-600">
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread notification${
                        unreadCount > 1 ? "s" : ""
                      }`
                    : "You're all caught up!"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
              >
                <FaCheckDouble />
                Mark All Read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "unread"
                  ? "bg-slate-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500">
                {filter === "unread"
                  ? "You have no unread notifications"
                  : "When you get notifications, they'll show up here"}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition hover:shadow-md ${
                  !notification.isRead
                    ? "border-l-4 border-l-blue-500"
                    : "border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 text-2xl mt-1">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className={`font-semibold ${
                            !notification.isRead
                              ? "text-slate-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {notification.message}
                        </p>
                        {notification.listingName && (
                          <p className="text-xs text-gray-500 mt-1">
                            Property: {notification.listingName}
                          </p>
                        )}
                      </div>

                      {/* Time & Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTime(notification.createdAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition p-1"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* Unread indicator dot */}
                    {!notification.isRead && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// NotificationsPanel.jsx
import React from "react";
import axios from "axios";

export default function NotificationsPanel({
  advisorId,
  notifications = [],
  setNotifications,
  fetchNotifications,
}) {
  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5001/api/advisor/notifications/${id}/read`,
        { advisorId }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error("Error marking as read", err);
    }
  };

  const clearAll = async () => {
    try {
      await axios.post(
        `http://localhost:5001/api/advisor/notifications/clear`,
        { advisorId }
      );
      setNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications", err);
    }
  };

  return (
    <div className="panel-root">
      <div className="panel-header">
        <h1 className="panel-title">Notifications</h1>
        <p className="panel-subtitle">
          New simulations, tickets, and important updates.
        </p>
      </div>

      <div className="panel-section-header">
        <button className="btn-soft" onClick={fetchNotifications}>
          Refresh
        </button>
        {notifications.length > 0 && (
          <button className="btn-ghost" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      <div className="panel-card list-card">
        {notifications.length === 0 && (
          <p className="empty-text">No notifications yet.</p>
        )}

        {notifications.map((n) => (
          <div
            key={n._id}
            className={`item-row ${
              !n.read ? "item-row-highlight" : ""
            }`}
          >
            <div>
              <p className="item-title">{n.title || "Notification"}</p>
              <p className="item-sub">
                {n.message || "No message provided."}
              </p>
              <p className="item-meta">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
            {!n.read && (
              <button
                className="btn-small"
                onClick={() => markAsRead(n._id)}
              >
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

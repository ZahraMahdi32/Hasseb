import React, { useState, useEffect } from "react";
import axios from "axios";
import AnalyzerPanel from "./AnalyzerPanel.jsx";

export default function DashboardAdvisorPanel({
  advisorId,
  tickets = [],
  notifications = [],
  feedback = [],
  setTab,
}) {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [recommendationText, setRecommendationText] = useState("");
  const [sending, setSending] = useState(false);

  // NEW — support tickets exactly like SupportPanel2
  const [supportTickets, setSupportTickets] = useState([]);

  useEffect(() => {
    if (!advisorId) return;
    fetchOwners();
    fetchSupportTickets();
  }, [advisorId]);

  // Get owners for dashboard
  const fetchOwners = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/advisor/dashboard/${advisorId}`
      );
      setOwners(res.data.owners || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  // NEW — fetch tickets EXACTLY like SupportPanel2
  const fetchSupportTickets = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("loggedUser"));
      const fromUserId = user?.userId;

      const res = await axios.get("http://localhost:5001/api/tickets", {
        params: { role: "advisor", userId: fromUserId },
      });

      setSupportTickets(res.data || []);
    } catch (err) {
      console.error("Dashboard support tickets error:", err);
    }
  };

  const handleSelectOwner = (owner) => {
    setSelectedOwner(owner);
    setOwnerData(owner.businessData || null);
  };

  const submitRecommendation = async () => {
    if (!recommendationText.trim() || !selectedOwner) return;

    setSending(true);
    try {
      await axios.post("http://localhost:5001/api/advisor/suggestions", {
        advisorId,
        ownerId: selectedOwner._id,
        suggestion: { text: recommendationText },
      });

      setRecommendationText("");
    } catch (err) {
      console.error("Error sending recommendation:", err);
    } finally {
      setSending(false);
    }
  };

  // FINAL — THIS IS NOW IDENTICAL TO SUPPORT PANEL
  const openTickets = supportTickets.filter((t) => t.status === "open").length;

  const unreadNotifications =
    Array.isArray(notifications) &&
    notifications.filter((n) => !n.read).length;

  const feedbackCount = Array.isArray(feedback) ? feedback.length : 0;

  return (
    <div className="support-container">
      {/* ===== TITLE ===== */}
      <h1 className="support-title">Advisor Dashboard</h1>

      {/* ===== STATS CARDS ===== */}
      <div className="stats-grid">

        {/* OPEN TICKETS — CLICKABLE */}
        <div
          className="stat-card clickable"
          onClick={() => setTab("support")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon-wrapper stat-icon-blue">📩</div>
          <div className="stat-content">
            <span className="stat-label">Open Tickets</span>
            <span className="stat-value">{openTickets}</span>
          </div>
        </div>

        {/* UNREAD NOTIFICATIONS — CLICKABLE */}
        <div
          className="stat-card clickable"
          onClick={() => setTab("notifications")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon-wrapper stat-icon-yellow">🔔</div>
          <div className="stat-content">
            <span className="stat-label">Unread Notifications</span>
            <span className="stat-value">{unreadNotifications || 0}</span>
          </div>
        </div>

        {/* FEEDBACK — CLICKABLE */}
        <div
          className="stat-card clickable"
          onClick={() => setTab("feedback")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-icon-wrapper stat-icon-green">💬</div>
          <div className="stat-content">
            <span className="stat-label">Total Feedback</span>
            <span className="stat-value">{feedbackCount}</span>
          </div>
        </div>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="two-column-grid">

        {/* LEFT: OWNERS */}
        <div className="support-card">
          <h2 className="card-title">Assigned Owners</h2>

          {owners.length === 0 && (
            <div className="empty-state">No owners assigned yet.</div>
          )}

          {owners.length > 0 && (
            <div className="tickets-list">
              {owners.map((owner) => (
                <div
                  key={owner._id}
                  className="ticket-item"
                  onClick={() => handleSelectOwner(owner)}
                >
                  <div className="ticket-item-left">
                    <div className="ticket-icon">👤</div>
                    <div className="ticket-info">
                      <div className="ticket-title">{owner.fullName}</div>
                      <div className="ticket-date">{owner.username}</div>
                    </div>
                  </div>
                  <span className="ticket-status status-open">Owner</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: DETAILS + ANALYZER + RECOMMENDATION */}
        <div className="tickets-section">
          {!selectedOwner ? (
            <div className="empty-state">
              Select an owner to view business details.
            </div>
          ) : (
            <>
              <h2 className="section-title">
                {selectedOwner.fullName} — Business Overview
              </h2>

              {/* BUSINESS DATA */}
              {!ownerData ? (
                <p className="support-error">
                  This owner has not uploaded business data.
                </p>
              ) : (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h3 className="card-title">Business Data</h3>

                  <div className="stats-grid" style={{ marginBottom: 0 }}>
                    <div className="stat-card">
                      <div className="stat-content">
                        <span className="stat-label">Fixed Cost</span>
                        <span className="stat-value">{ownerData.fixedCost}</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-content">
                        <span className="stat-label">Variable Cost</span>
                        <span className="stat-value">
                          {ownerData.products?.[0]?.variableCostPerUnit}
                        </span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-content">
                        <span className="stat-label">Price / Unit</span>
                        <span className="stat-value">
                          {ownerData.products?.[0]?.pricePerUnit}
                        </span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-content">
                        <span className="stat-label">Avg Units</span>
                        <span className="stat-value">
                          {ownerData.avgMonthlyUnits}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* RECOMMENDATION FORM */}
              
            </>
          )}
        </div>

      </div>
    </div>
  );
}

// RecommendationsPanel.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function RecommendationsPanel({
  owners = [],
  advisorId,
  setTab,   
  prevTab   
}) {

  const [ownerId, setOwnerId] = useState("");
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ============================
  // LOAD SENT RECOMMENDATIONS
  // ============================
  useEffect(() => {
    if (!advisorId) return;
    fetchRecommendations();
  }, [advisorId]);

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/advisor/recommendations/${advisorId}`
      );
      setItems(res.data || []);
    } catch (err) {
      console.error("Error loading recommendations:", err);
    }
  };

  // ============================
  // SEND NEW RECOMMENDATION
  // ============================
  const sendRecommendation = async () => {
    if (!ownerId || !text.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5001/api/advisor/recommendations",
        { advisorId, ownerId, text }
      );

      const rec = res.data?.recommendation || res.data;

      // Add instantly to UI
      if (rec) setItems((prev) => [rec, ...prev]);

      setText("");
      setOwnerId("");
    } catch (err) {
      console.error("Error sending recommendation", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-container">
      {/* ===== HEADER ===== */}
      <h1 className="support-title">Recommendations</h1>
      <p className="support-subtitle">
        Send business recommendations directly to owners.
      </p>
    <button className="back-btn" onClick={() => setTab(prevTab)}>← Back</button>



      {/* ===== FORM CARD ===== */}
      <div className="support-card">
        <div className="ticket-form">

          {/* OWNER SELECT */}
          <div className="form-row">
            <label className="form-label">Owner</label>
            <select
              className="ticket-input"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
            >
              <option value="">Select Owner</option>
              {owners.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.username || o.fullName || "Owner"}
                </option>
              ))}
            </select>
          </div>

          {/* TEXT */}
          <div className="form-row">
            <label className="form-label">Recommendation</label>
            <textarea
              className="ticket-textarea"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a clear, actionable recommendation..."
            />
          </div>

          {/* SUBMIT */}
          <button
            className="submit-btn"
            onClick={sendRecommendation}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Recommendation"}
          </button>
        </div>
      </div>

      {/* ===== SENT RECOMMENDATIONS ===== */}
      <div className="tickets-section">
        <h2 className="section-title">Sent Recommendations</h2>

        <div className="support-card">
          {items.length === 0 ? (
            <p className="empty-state">No recommendations sent yet.</p>
          ) : (
            items.map((r) => (
              <div
                key={r._id}
                className="ticket-item"
                style={{ alignItems: "flex-start" }}
              >
                <div className="ticket-item-left">
                  <div className="ticket-icon">💬</div>

                  <div className="ticket-info">
                    <div className="ticket-title">
                      To: {r.ownerName || r.owner?.username || "Owner"}
                    </div>

                    <div className="ticket-date">{r.text}</div>

                    <div className="ticket-date" style={{ fontSize: "12px" }}>
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <span className="ticket-status status-open">Sent</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiTag,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiSend,
  FiMessageCircle,
} from "react-icons/fi";
import "../../SharedStyles/SharedSupport.css";

const TICKETS_API_URL = "http://localhost:5001/api/tickets";

export default function SupportPanel2({
  setTab,  
  prevTab,
  setSelectedTicket   
}) {
  const user = JSON.parse(localStorage.getItem("loggedUser"));
  const fromUserId = user?.userId;
  const fromRole = "advisor";

  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchTickets() {
    try {
      setError("");
      const res = await axios.get(TICKETS_API_URL, {
        params: { role: "advisor", userId: fromUserId },
      });
      setTickets(res.data || []);
    } catch (err) {
      console.error("fetchTickets error:", err);
      setError("Failed to load tickets.");
    }
  }

  useEffect(() => {
    if (fromUserId) fetchTickets();
  }, [fromUserId]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("Please fill in both title and description.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(TICKETS_API_URL, {
        fromUserId,
        fromRole,
        subject: title.trim(),
        message: description.trim(),
        priority,
      });

      setTitle("");
      setDescription("");
      setPriority("medium");

      await fetchTickets();
    } catch (err) {
      console.error("createTicket error:", err);
      setError("Server error while creating ticket.");
    } finally {
      setLoading(false);
    }
  }
  <button
    className="back-btn"
    onClick={() => setTab(prevTab)}
    style={{
      marginBottom: "1rem",
      padding: "8px 16px",
      background: "#eee",
      borderRadius: "8px",
      cursor: "pointer",
    }}
  >
    ⬅ Back
  </button>


  const total = tickets.length;
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) =>
    ["inprogress", "in-progress"].includes(t.status)
  ).length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;

  function getStatusClass(status) {
    if (status === "resolved") return "status-resolved";
    if (["inprogress", "in-progress"].includes(status))
      return "status-progress";
    return "status-open";
  }

  return (
    <div className="support-container">
      <h1 className="support-title">Support & Tickets</h1>
      <button className="back-btn" onClick={() => setTab(prevTab)}>← Back</button>

      {error && (
        <div className="support-error">
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">
            <FiTag size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Tickets</div>
            <div className="stat-value">{total}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-yellow">
            <FiAlertCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Open</div>
            <div className="stat-value">{openCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-orange">
            <FiClock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">In Progress</div>
            <div className="stat-value">{inProgressCount}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-green">
            <FiCheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Resolved</div>
            <div className="stat-value">{resolvedCount}</div>
          </div>
        </div>
      </div>

      {/* Form + Tickets */}
      <div className="two-column-grid">
        <div className="support-card">
          <h2 className="card-title">Create New Ticket</h2>

          <form onSubmit={handleSubmit} className="ticket-form">
            <input
              className="ticket-input"
              placeholder="Ticket Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="form-label">Priority</label>
            <select
              className="ticket-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <textarea
              className="ticket-textarea"
              rows={4}
              placeholder="Describe your issue…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button type="submit" className="submit-btn" disabled={loading}>
              <FiSend size={18} />
              {loading ? "Sending…" : "Submit Ticket"}
            </button>
          </form>
        </div>

        <div className="tickets-section">
          <h2 className="section-title">Your Tickets</h2>

          {tickets.length === 0 ? (
            <div className="empty-state">No tickets yet.</div>
          ) : (
            <div className="tickets-list">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="ticket-item"
                  onClick={() => {
                    setSelectedTicket(t);
                    setTab("ticketDetails");
                  }}
                >
                  <div className="ticket-item-left">
                    <div className="ticket-icon">
                      <FiMessageCircle size={20} />
                    </div>
                    <div className="ticket-info">
                      <div className="ticket-title">{t.subject}</div>
                      <div className="ticket-date">
                        {new Date(t.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <span className={`ticket-status ${getStatusClass(t.status)}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

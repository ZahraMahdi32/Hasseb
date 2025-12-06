import React, { useState } from "react";
import { FiArrowLeft, FiSend, FiAlertCircle } from "react-icons/fi";
import "../../SharedStyles/SharedSupport.css";
import "../../SharedStyles/SharedTicketDetails.css";

export default function TicketDetailsPanel({ ticket, setTab }) {
  const user = JSON.parse(localStorage.getItem("loggedUser"));
  const role = user?.role || "advisor";

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (!ticket) {
    return (
      <div className="ticket-not-found">
        <FiAlertCircle size={48} />
        <p>No ticket selected. Please select one from support page.</p>
      </div>
    );
  }

  async function sendReply() {
    if (!reply.trim()) return;

    try {
        setSending(true);
        setError("");

        const res = await fetch(
            `http://localhost:5001/api/tickets/${ticket.id}/reply`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderRole: role,
                    text: reply.trim(),
                }),
            }
        );

        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(errBody.message || "Failed to send reply");
        }

        // 🟢 Add reply instantly to UI
        const newMessage = {
            senderRole: role,
            text: reply.trim(),
            at: new Date().toISOString(),
        };

        ticket.messages = [...(ticket.messages || []), newMessage];

        setReply("");

    } catch (err) {
        console.error("sendReply error:", err);
        setError(err.message || "Failed to send reply.");
    } finally {
        setSending(false);
    }
  }



  function getStatusClass(status) {
    if (status === "resolved") return "status-resolved";
    if (status === "inprogress") return "status-progress";
    return "status-open";
  }

  return (
    <div className="ticket-details-container">

      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => setTab("support")}>
        <FiArrowLeft size={20} />
        Back to Tickets
      </button>

      {/* MAIN CARD */}
      <div className="ticket-details-card">

        {/* HEADER */}
        <div className="ticket-header">
          <h1 className="ticket-subject">{ticket.subject}</h1>

          <span className={`ticket-status ${getStatusClass(ticket.status)}`}>
            {ticket.status}
          </span>
        </div>

        {/* META INFO */}
        <div className="ticket-meta">
          <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
          {ticket.updatedAt && (
            <span>Updated: {new Date(ticket.updatedAt).toLocaleString()}</span>
          )}
        </div>

        <div className="divider" />

        {/* CONVERSATION */}
        <h3 className="conversation-title">Conversation</h3>

        <div className="messages-container">
          {ticket.messages?.length ? (
            ticket.messages.map((m, i) => {
              const isAdvisor = m.senderRole === "advisor";
              const isManager = m.senderRole === "manager";

              return (
                <div
                  key={i}
                  className={`message ${
                    isAdvisor
                      ? "message-advisor"
                      : isManager
                      ? "message-manager"
                      : "message-owner"
                  }`}
                >
                  <div className="message-bubble">
                    <div className="message-sender">
                      {isManager ? "Manager" : isAdvisor ? "You" : m.senderRole}
                    </div>

                    <div className="message-text">{m.text}</div>

                    <div className="message-time">
                      {m.at ? new Date(m.at).toLocaleString() : ""}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-messages">No messages.</div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="reply-error">
            <FiAlertCircle size={18} />
            {error}
          </div>
        )}

        {/* REPLY BOX */}
        <div className="reply-section">
          <input
            className="reply-input"
            placeholder="Type your reply..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !sending && reply.trim()) sendReply();
            }}
          />

          <button
            className="reply-btn"
            disabled={sending || !reply.trim()}
            onClick={sendReply}
          >
            <FiSend size={18} />
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FeedbackPanel({
  feedback = [],
  setFeedback,
  fetchFeedback,
  setTab,
  advisorId,
  owners=[],     
  prevTab   
}) {

  const [items, setItems] = useState([]);
  const [ownerId, setOwnerId] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const [active, setActive] = useState(null);
  const [editText, setEditText] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    setItems(feedback);
  }, [feedback]);

  const addFeedback = async () => {
    if (!ownerId || !content.trim()) return;
    setSending(true);
    try {
      const res = await axios.post(
        "http://localhost:5001/api/advisor/feedback",
        {
          advisorId,
          ownerId,
          content,
        }
      );
      const fb = res.data?.feedback || res.data;
      if (fb) {
        setItems((prev) => [fb, ...prev]);
        if (setFeedback) setFeedback((prev) => [fb, ...prev]);
      } else if (fetchFeedback) {
        fetchFeedback();
      }
      setContent("");
      setOwnerId("");
    } catch (err) {
      console.error("Error adding feedback", err);
    } finally {
      setSending(false);
    }
  };

  const startEdit = (item) => {
    setActive(item._id);
    setEditText(item.content);
    setShowEdit(true);
  };
  <button className="back-btn" onClick={() => setTab(prevTab)}>
    ← Back
  </button>



  const saveEdit = async () => {
    if (!editText.trim()) return;
    try {
      const res = await axios.put(
        `http://localhost:5001/api/advisor/feedback/${active}`,
        {
          advisorId,
          content: editText,
        }
      );
      const updated = res.data?.feedback || res.data;
      setItems((prev) =>
        prev.map((it) => (it._id === active ? updated : it))
      );
      if (setFeedback) {
        setFeedback((prev) =>
          prev.map((it) => (it._id === active ? updated : it))
        );
      }
      setShowEdit(false);
      setActive(null);
      setEditText("");
    } catch (err) {
      console.error("Error updating feedback", err);
    }
  };

  const deleteFeedback = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5001/api/advisor/feedback/${id}`,
        {
          data: { advisorId },
        }
      );
      setItems((prev) => prev.filter((it) => it._id !== id));
      if (setFeedback) {
        setFeedback((prev) => prev.filter((it) => it._id !== id));
      }
    } catch (err) {
      console.error("Error deleting feedback", err);
    }
  };

  const getOwnerName = (id) => {
    const owner = owners.find((o) => o._id === id);
    return owner?.name || owner?.username || "Owner";
  };

  return (
    <div className="support-container">
      <h1 className="support-title">Feedback</h1>
      <button className="back-btn" onClick={() => setTab(prevTab)}>← Back</button>

      <div className="two-column-grid">
        {/* LEFT: FORM */}
        <div className="support-card">
          <h2 className="card-title">Create Feedback</h2>

          <div className="ticket-form">
            <div className="form-row">
              <label className="form-label">Owner</label>
              <select
                className="ticket-select"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
              >
                <option value="">Select owner</option>
                {owners.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.name || o.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label className="form-label">Feedback</label>
              <textarea
                className="ticket-textarea"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write clear, actionable feedback..."
              />
            </div>

            <button
              className="submit-btn"
              onClick={addFeedback}
              disabled={sending}
            >
              {sending ? "Sending..." : "Send feedback"}
            </button>
          </div>
        </div>

        {/* RIGHT: LIST */}
        <div className="tickets-section">
          <div className="d-flex justify-content-between align-items-center" style={{ marginBottom: "0.75rem" }}>
            <h2 className="section-title">All Feedback</h2>
            <button className="submit-btn" style={{ padding: "0.4rem 1.2rem" }} onClick={fetchFeedback}>
              Refresh
            </button>
          </div>

          {items.length === 0 && (
            <div className="empty-state">No feedback yet.</div>
          )}

          {items.length > 0 && (
            <div className="tickets-list">
              {items.map((fb) => {
                const isEditing = showEdit && active === fb._id;
                return (
                  <div key={fb._id} className="ticket-item">
                    <div className="ticket-item-left">
                      <div className="ticket-icon">💬</div>
                      <div className="ticket-info">
                        <div className="ticket-title">
                          Feedback for: {getOwnerName(fb.ownerId || fb.owner)}
                        </div>
                        <div className="ticket-date">
                          {new Date(fb.createdAt).toLocaleString()}
                        </div>
                        {!isEditing && (
                          <p style={{ marginTop: "0.35rem", fontSize: "0.9rem" }}>
                            {fb.content}
                          </p>
                        )}
                        {isEditing && (
                          <textarea
                            className="ticket-textarea"
                            rows={3}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            style={{ marginTop: "0.5rem" }}
                          />
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {!isEditing ? (
                        <>
                          <button
                            className="submit-btn"
                            style={{ padding: "0.35rem 1rem" }}
                            onClick={() => startEdit(fb)}
                          >
                            Edit
                          </button>
                          <button
                            className="submit-btn"
                            style={{
                              padding: "0.35rem 1rem",
                              background: "#FF5757",
                            }}
                            onClick={() => deleteFeedback(fb._id)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="submit-btn"
                            style={{ padding: "0.35rem 1rem" }}
                            onClick={saveEdit}
                          >
                            Save
                          </button>
                          <button
                            className="submit-btn"
                            style={{
                              padding: "0.35rem 1rem",
                              background: "#e5e7eb",
                              color: "#082830",
                              boxShadow: "none",
                            }}
                            onClick={() => {
                              setShowEdit(false);
                              setActive(null);
                              setEditText("");
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

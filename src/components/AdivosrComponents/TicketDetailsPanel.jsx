import React, { useState } from "react";
import { FiArrowLeft, FiMessageCircle } from "react-icons/fi";

export default function TicketDetailsPanel({ ticket, setTab }) {

  // Hooks ALWAYS at the top:
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "john.doe@company.com",
      text: "Thanks for reporting this. I’ll investigate the issue. Can you tell me the exact model?",
      date: "Jan 15, 2024, 10:15 AM",
    },
  ]);

  const [commentText, setCommentText] = useState("");

  // Now safe because hooks are above:
  if (!ticket) {
    return (
      <div className="container-xxl">
        <div className="card-neo p-4 mt-4">
          <h5>No ticket selected</h5>
          <button className="btn btn-dark mt-3" onClick={() => setTab("support")}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const addComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Math.random(),
      author: "you@company.com",
      text: commentText,
      date: new Date().toLocaleString(),
    };

    setComments([newComment, ...comments]);
    setCommentText("");
  };

  return (
    <div className="container-xxl">

      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-light border" onClick={() => setTab("support")}>
          <FiArrowLeft /> Back to Tickets
        </button>

        <h4 className="fw-bold mb-0">{ticket.title}</h4>

        <span className="badge rounded-pill text-bg-primary">{ticket.status}</span>
        <span className="badge rounded-pill text-bg-secondary">{ticket.priority}</span>
      </div>

      <div className="card-neo p-4 mb-4">
        <h6 className="fw-bold mb-2">Description</h6>
        <p className="text-muted">
          {ticket.description ??
            "After the latest Windows update, the issue persists…"}
        </p>
      </div>

      <div className="card-neo p-4 mb-4">
        <h6 className="fw-bold d-flex align-items-center gap-2">
          <FiMessageCircle /> Comments ({comments.length})
        </h6>

        {comments.map((c) => (
          <div key={c.id} className="border rounded p-3 mb-3 bg-white">
            <div className="fw-semibold">{c.author}</div>
            <div className="text-muted small mb-2">{c.date}</div>
            <div>{c.text}</div>
          </div>
        ))}

        <textarea
          className="form-control mt-3"
          rows="2"
          placeholder="Add a comment…"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        ></textarea>

        <button className="btn btn-dark mt-2" onClick={addComment}>
          Add Comment
        </button>
      </div>

      <div className="card-neo p-4 mb-4">
        <h6 className="fw-bold">Ticket Information</h6>

        <div className="text-muted small mt-2">
          <div><strong>Category:</strong> {ticket.category}</div>
          <div><strong>Submitted by:</strong> user@company.com</div>
          <div><strong>Created:</strong> Jan 15, 2024, 09:30 AM</div>
          <div><strong>Updated:</strong> Jan 15, 2024, 10:15 AM</div>
          <div><strong>Assigned to:</strong> john.doe@company.com</div>
        </div>
      </div>

    </div>
  );
}

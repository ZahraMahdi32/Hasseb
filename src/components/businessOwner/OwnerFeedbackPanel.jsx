import React, { useEffect, useState } from "react";

export default function OwnerFeedbackPanel() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("loggedUser"));
      if (!user) return;

      const ownerId = user.userId;

      const res = await fetch(
        `http://localhost:5001/api/advisor/feedback/owner/${ownerId}`
      );

      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      console.error("Error loading feedback:", err);
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <div className="p-4">Loading feedback…</div>;

  return (
    <div className="container-xxl">
      <div className="card-neo p-4">
        <h3 className="mb-3">Advisor Feedback</h3>
        <p className="text-muted mb-4">
          Here you can review recommendations and insights from your advisor.
        </p>

        {feedback.length === 0 && (
          <div className="text-muted">No feedback yet.</div>
        )}

        {/* FEEDBACK LIST */}
        <div className="d-flex flex-column gap-3">
          {feedback.map((item) => (
            <div className="feedback-item card-neo p-3" key={item._id}>
              <div className="fw-bold">{item.content}</div>
              <div className="small text-muted mt-1">
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

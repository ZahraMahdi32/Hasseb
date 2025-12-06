import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiEye,
  FiTrash2,
  FiDownload,
  FiArrowLeft,
  FiEdit2,
} from "react-icons/fi";

export default function FeedbackPanel({ feedback = [], owners = [], advisorId }) {
  const [items, setItems] = useState([]);
  const [addingOwner, setAddingOwner] = useState("");
  const [addingContent, setAddingContent] = useState("");

  const [active, setActive] = useState(null);
  const [editText, setEditText] = useState("");

  // Sync incoming feedback ONCE when props change
  useEffect(() => {
    setItems(feedback);
  }, [feedback]);

  // -----------------------------
  // ADD NEW FEEDBACK
  // -----------------------------
  const addFeedback = async () => {
    if (!addingOwner) return alert("Select an owner");
    if (!addingContent.trim()) return alert("Feedback content required");

    try {
      const res = await axios.post("http://localhost:5001/api/advisor/feedback", {
        advisorId,
        ownerId: addingOwner,
        content: addingContent,
      });

      setItems((prev) => [res.data.feedback, ...prev]);

      setAddingOwner("");
      setAddingContent("");

      alert("Feedback sent!");
    } catch (err) {
      console.error(err);
      alert("Error sending feedback");
    }
  };

  // -----------------------------
  // DELETE FEEDBACK
  // -----------------------------
  const deleteOne = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/advisor/feedback/${id}`);
      setItems((prev) => prev.filter((i) => i._id !== id));
      setActive(null);
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------
  // SAVE EDIT
  // -----------------------------
  const saveEdit = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5001/api/advisor/feedback/${id}`,
        { content: editText }
      );

      setItems((prev) =>
        prev.map((i) => (i._id === id ? res.data : i))
      );

      setActive(null);
      setEditText("");
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------
  // RENDER (ACTIVE FEEDBACK VIEW)
  // -----------------------------
  if (active) {
    const owner = owners.find((o) => o._id === active.ownerId);

    return (
      <div className="bg-white shadow p-4 rounded-xl mb-5">
        <button
          className="btn btn-light border mb-3"
          onClick={() => setActive(null)}
        >
          <FiArrowLeft /> Back
        </button>

        <h4 className="fw-bold">Feedback Details</h4>

        <p className="text-muted small">
          {new Date(active.createdAt).toLocaleString()}
        </p>

        {owner && (
          <p className="fw-semibold">For: {owner.fullName}</p>
        )}

        <p className="mt-3">{active.content}</p>

        <div className="mt-4 d-flex gap-3">
          <button
            className="btn btn-dark"
            onClick={() => setEditText(active.content)}
          >
            <FiEdit2 /> Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => deleteOne(active._id)}
          >
            <FiTrash2 /> Delete
          </button>
        </div>

        {editText !== "" && (
          <div className="mt-4">
            <textarea
              className="form-control mb-2"
              rows={3}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            ></textarea>

            <button
              className="btn btn-primary"
              onClick={() => saveEdit(active._id)}
            >
              Save Changes
            </button>

            <button
              className="btn btn-secondary ms-2"
              onClick={() => setEditText("")}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  // -----------------------------
  // RENDER MAIN PANEL
  // -----------------------------

  return (
    <div className="bg-white shadow p-4 rounded-xl mb-6">
      <h3 className="fw-bold mb-3">Feedback</h3>

      {/* ADD FEEDBACK */}
      <div className="mb-4">
        <select
          className="form-select mb-2"
          value={addingOwner}
          onChange={(e) => setAddingOwner(e.target.value)}
        >
          <option value="">Select owner</option>
          {owners.map((o) => (
            <option key={o._id} value={o._id}>
              {o.fullName}
            </option>
          ))}
        </select>

        <textarea
          className="form-control"
          rows={2}
          placeholder="Write feedback..."
          value={addingContent}
          onChange={(e) => setAddingContent(e.target.value)}
        ></textarea>

        <button className="btn btn-dark mt-2" onClick={addFeedback}>
          Add Feedback
        </button>
      </div>

      {/* FEEDBACK LIST */}
      <div className="d-flex flex-column gap-3">
        {items.map((fb) => {
          const owner = owners.find((o) => o._id === fb.ownerId);

          return (
            <div
              key={fb._id}
              className="card-neo p-3 d-flex justify-content-between"
            >
              <div>
                <div className="text-muted small">
                  {new Date(fb.createdAt).toLocaleString()}
                </div>

                {owner && (
                  <div className="fw-semibold small">
                    Feedback for: {owner.fullName}
                  </div>
                )}

                <div>{fb.content}</div>
              </div>

              <button
                className="btn btn-outline-dark"
                onClick={() => setActive(fb)}
              >
                <FiEye /> View
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

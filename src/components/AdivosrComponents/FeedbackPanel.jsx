import React, { useState } from "react";
import {
  FiMessageCircle,
  FiTrash2,
  FiDownload,
  FiEye,
  FiArrowLeft,
  FiEdit2,
} from "react-icons/fi";

export default function FeedbackPanel() {
  const [items, setItems] = useState([
    {
      id: "1",
      author: "john.doe@company.com",
      text: "Please check VC vs price margin.",
      at: "Jan 15, 2024, 10:15 AM",
    },
    {
      id: "2",
      author: "nancy@company.com",
      text: "Pricing experiment shows abnormal variance.",
      at: "Jan 14, 2024, 4:20 PM",
    },
  ]);

  const [txt, setTxt] = useState("");
  const [activeFeedback, setActiveFeedback] = useState(null);
  const [editText, setEditText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  // Add comment
  const addComment = () => {
    const v = txt.trim();
    if (!v) return;
    setItems((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        author: "you@haseeb.sa",
        text: v,
        at: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    setTxt("");
  };

  // Export ALL feedback
  const exportAll = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "all-feedback.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Delete single item
  const deleteOne = (id) => {
    setItems(items.filter((i) => i.id !== id));
    setActiveFeedback(null);
  };

  // Edit feedback
  const openEdit = (item) => {
    setEditText(item.text);
    setShowEditModal(true);
  };

  const saveEdit = () => {
    setItems(
      items.map((i) =>
        i.id === activeFeedback.id ? { ...i, text: editText } : i
      )
    );
    setActiveFeedback({ ...activeFeedback, text: editText });
    setShowEditModal(false);
  };

  // DETAILS VIEW
  if (activeFeedback) {
    return (
      <div className="container-xxl">
        <button
          className="btn btn-light mb-3 border"
          onClick={() => setActiveFeedback(null)}
        >
          <FiArrowLeft /> Back
        </button>

        <div className="card-neo p-4">
          <h4 className="fw-bold d-flex align-items-center gap-2">
            <FiMessageCircle /> Feedback Details
          </h4>

          <div className="mt-3">
            <div className="fw-semibold">{activeFeedback.author}</div>
            <div className="text-muted small mb-3">{activeFeedback.at}</div>
            <p>{activeFeedback.text}</p>
          </div>

          <div className="d-flex gap-3 mt-4">
            <button className="btn btn-dark" onClick={() => openEdit(activeFeedback)}>
              <FiEdit2 /> Edit
            </button>

            <button
              className="btn btn-danger"
              onClick={() => deleteOne(activeFeedback.id)}
            >
              <FiTrash2 /> Delete
            </button>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <>
            <div className="modal-backdrop fade show" />
            <div className="modal fade show d-block">
              <div className="modal-dialog modal-sm modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h6 className="modal-title">Edit Feedback</h6>
                    <button
                      className="btn-close"
                      onClick={() => setShowEditModal(false)}
                    />
                  </div>

                  <div className="modal-body">
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-dark" onClick={saveEdit}>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // MAIN LIST VIEW
  return (
    <div className="container-xxl">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Feedback</h4>

        <button className="btn btn-outline-dark" onClick={exportAll}>
          <FiDownload /> Export All
        </button>
      </div>

      {/* Add Feedback */}
      <div className="card-neo p-3 mb-4">
        <textarea
          className="form-control"
          rows="2"
          placeholder="Add a comment…"
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
        ></textarea>

        <button className="btn btn-dark mt-2" onClick={addComment}>
          Add Comment
        </button>
      </div>

      {/* List */}
      <div className="d-flex flex-column gap-3">
        {items.map((c) => (
          <div key={c.id} className="card-neo p-3 d-flex gap-3">

            <div className="flex-grow-1">
              <div className="fw-semibold">{c.author}</div>
              <div className="text-muted small">{c.at}</div>
              <div className="mt-2">{c.text}</div>
            </div>

            <button
              className="btn btn-outline-dark"
              onClick={() => setActiveFeedback(c)}
            >
              <FiEye /> View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

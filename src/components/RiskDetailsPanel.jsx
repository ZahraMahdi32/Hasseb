import React from "react";
import { FiArrowLeft, FiAlertTriangle, FiPenTool } from "react-icons/fi";

export default function RiskDetailsPanel({ risk, setTab }) {
  if (!risk) return null;

  return (
    <div className="container-xxl">

      {/* Back Button + Title */}
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn btn-outline-secondary me-3"
          onClick={() => setTab("dashboard")}
        >
          <FiArrowLeft /> Back
        </button>

        <h3 className="fw-bold mb-0">Risk Alert — {risk.name}</h3>
      </div>

      {/* Risk Box */}
      <div className="card-neo p-4">

        <h4 className="fw-bold d-flex align-items-center gap-2">
          <FiAlertTriangle className="text-danger" />
          {risk.msg}
        </h4>

        <div className="text-muted small mt-1">
          Tags: {risk.tags.join(", ")}
        </div>

        <div className="mt-3">
          <strong>Date:</strong> {risk.date}
        </div>
        <div>
          <strong>Time:</strong> {risk.time}
        </div>

        <hr />

        <p className="text-muted">
          • This risk alert is auto-generated based on the client’s financial data. <br />
          • Please review the client’s latest performance and contact them if needed. <br />
          • This section is for display/demo purposes only (not fully accurate).
        </p>

        {/* WRITE FEEDBACK BUTTON */}
        <div className="mt-4 text-end">
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setTab("feedback")}
          >
            <FiPenTool size={16} />
            Write Feedback
          </button>
        </div>

      </div>
    </div>
  );
}

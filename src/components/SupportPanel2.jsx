import React, { useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiClock, FiPlus } from "react-icons/fi";

export default function SupportPanel2({ setTab, setSelectedTicket }) {

  const [tickets, setTickets] = useState([
    {
      id: Date.now() + 1,
      title: "Computer won’t start after Windows update",
      category: "Hardware Issues",
      status: "open",
      priority: "high",
      description: "After the latest Windows update my computer shows a blue screen on startup."
    },
    {
      id: Date.now() + 2,
      title: "Unable to access shared network drive",
      category: "Network Connectivity",
      status: "in progress",
      priority: "medium",
      description: "Cannot connect to network drive since IT updated system."
    },
    {
      id: Date.now() + 3,
      title: "Printer not responding",
      category: "Printer/Scanner",
      status: "resolved",
      priority: "low",
      description: "Printer doesn’t scan or respond to print commands."
    },
  ]);

  const [newTicket, setNewTicket] = useState({
    title: "",
    category: "",
    priority: "Medium",
    description: "",
  });

  const createTicket = () => {
    if (!newTicket.title.trim() || !newTicket.category.trim() || !newTicket.description.trim())
      return alert("Please fill all required fields");

    const newData = {
      id: Date.now(),
      title: newTicket.title,
      category: newTicket.category,
      status: "open",
      priority: newTicket.priority.toLowerCase(),
      description: newTicket.description,
    };

    setTickets([newData, ...tickets]);

    // Clear form
    setNewTicket({
      title: "",
      category: "",
      priority: "Medium",
      description: "",
    });

    alert("Ticket submitted successfully!");
  };

  return (
    <div className="container-xxl">

      <h4 className="fw-bold">IT Support Dashboard</h4>
      <div className="text-muted mb-4">Submit and track your IT support requests</div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card-neo p-3 text-center">
            <FiAlertCircle size={22} className="text-primary mb-2" />
            <h5 className="fw-bold">{tickets.length}</h5>
            <div className="text-muted small">Total Tickets</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card-neo p-3 text-center">
            <FiClock size={22} className="text-warning mb-2" />
            <h5 className="fw-bold">{tickets.filter(t => t.status === "open").length}</h5>
            <div className="text-muted small">Open</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card-neo p-3 text-center">
            <FiClock size={22} className="text-info mb-2" />
            <h5 className="fw-bold">{tickets.filter(t => t.status === "in progress").length}</h5>
            <div className="text-muted small">In Progress</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card-neo p-3 text-center">
            <FiCheckCircle size={22} className="text-success mb-2" />
            <h5 className="fw-bold">{tickets.filter(t => t.status === "resolved").length}</h5>
            <div className="text-muted small">Resolved</div>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="card-neo p-4">
        <h6 className="fw-bold mb-3">Your Recent Tickets</h6>

        {tickets.map((t) => (
          <div
            key={t.id}
            className="p-3 mb-3 rounded border"
            style={{ cursor: "pointer", background: "#fff" }}
            onClick={() => {
              setSelectedTicket(t);
              setTab("ticket-details");
            }}
          >
            <div className="fw-semibold mb-1">{t.title}</div>
            <div className="text-muted small mb-2">Category: {t.category}</div>

            <div className="d-flex gap-2">
              <span className={`badge rounded-pill text-bg-${t.status === "open" ? "primary" : t.status === "in progress" ? "warning" : "success"}`}>
                {t.status}
              </span>

              <span className={`badge rounded-pill text-bg-${t.priority === "high" ? "danger" : t.priority === "medium" ? "secondary" : "light"}`}>
                {t.priority}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Ticket */}
      <div className="card-neo p-4 mt-4">
        <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <FiPlus /> Submit New IT Support Ticket
        </h6>

        <div className="row g-3">
          {/* Title */}
          <div className="col-12">
            <label className="form-label small">Ticket Title *</label>
            <input
              className="form-control"
              placeholder="Brief description of the issue"
              value={newTicket.title}
              onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="col-md-6">
            <label className="form-label small">Category *</label>
            <select
              className="form-select"
              value={newTicket.category}
              onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
            >
              <option value="">Select category</option>
              <option value="Hardware Issues">Hardware Issues</option>
              <option value="Network Connectivity">Network Connectivity</option>
              <option value="Printer/Scanner">Printer/Scanner</option>
            </select>
          </div>

          {/* Priority */}
          <div className="col-md-6">
            <label className="form-label small">Priority *</label>
            <select
              className="form-select"
              value={newTicket.priority}
              onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
            >
              <option>Medium</option>
              <option>High</option>
              <option>Low</option>
            </select>
          </div>

          {/* Description */}
          <div className="col-12">
            <label className="form-label small">Description *</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Detailed description…"
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
            ></textarea>
          </div>

          <div className="col-12 mt-2">
            <button className="btn btn-dark px-4" onClick={createTicket}>
              Submit Ticket
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

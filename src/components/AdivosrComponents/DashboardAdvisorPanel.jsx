import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { FiClock } from "react-icons/fi";

export default function DashboardAdvisorPanel({
  setTab,
  setSelectedClient,
  setSelectedRisk,
}) {

  const alerts = [
    {
      name: "Norah",
      msg: "Low cash buffer",
      tags: ["Medium"],
      date: "23 Mar 2024",
      time: "12:45 pm",
    },
    {
      name: "Rakib",
      msg: "High variable costs",
      tags: ["High priority", "Medium"],
      date: "23 Mar 2024",
      time: "1:30 pm",
    },
  ];

  const activityData = [
    { day: "Sat", valueA: 450, valueB: 320 },
    { day: "Sun", valueA: 300, valueB: 150 },
    { day: "Mon", valueA: 200, valueB: 280 },
    { day: "Tue", valueA: 480, valueB: 200 },
    { day: "Wed", valueA: 120, valueB: 180 },
    { day: "Thu", valueA: 350, valueB: 290 },
    { day: "Fri", valueA: 260, valueB: 210 },
  ];

  return (
    <div className="container-xxl">

      {/* Clients with Active Simulations */}
      <div className="card-neo p-4 mb-4">
        <h4 className="fw-bold mb-3">Clients with Active Simulations</h4>

        <div className="d-flex flex-column gap-3">

          {/* Rakib */}
          <div
            className="d-flex justify-content-between align-items-center p-3 rounded-3 border bg-white shadow-sm"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setSelectedClient({
                name: "Rakib",
                simulation: "Break-even Simulation",
                updated: "09:16 AM",
              });
              setTab("simulation_details");
            }}
          >
            <div className="fw-semibold">Rakib</div>
            <div className="text-muted small">Break-even Simulation</div>
            <div className="text-muted small">Updated 09:16 AM</div>
          </div>

          {/* Abrar */}
          <div
            className="d-flex justify-content-between align-items-center p-3 rounded-3 border bg-white shadow-sm"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setSelectedClient({
                name: "Abrar",
                simulation: "Break-even Simulation",
                updated: "12:14 AM",
              });
              setTab("simulation_details");
            }}
          >
            <div className="fw-semibold">Abrar</div>
            <div className="text-muted small">Break-even Simulation</div>
            <div className="text-muted small">Updated 12:14 AM</div>
          </div>

        </div>
      </div>

      {/* Risk Alerts */}
      <div className="card-neo p-4 mb-4">
        <h4 className="fw-bold">Top 3 Risk Alerts</h4>
        <div className="text-muted mb-3">You need to tell them</div>

        <div className="d-flex gap-3 flex-wrap">
          {alerts.map((a, i) => (
            <div
              key={i}
              className="card shadow-sm p-3"
              style={{ width: 260, cursor: "pointer" }}
              onClick={() => {
                setSelectedRisk(a);
                setTab("risk-details");
              }}
            >
              <strong className="mb-1 d-block">{a.name}</strong>
              <div className="text-muted">{a.msg}</div>

              <div className="d-flex gap-2 mt-2">
                {a.tags.map((t) => (
                  <span key={t} className="badge rounded-pill text-bg-secondary">
                    {t}
                  </span>
                ))}
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3 text-muted small">
                <span>{a.date}</span>
                <span className="d-flex align-items-center gap-1">
                  <FiClock /> {a.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advisor Points */}
      <div className="mb-2">
        <span className="badge bg-danger-subtle text-danger p-3 rounded-3">
          Advisor Points: 320
        </span>
        <div className="text-muted">Rank: 4th this month</div>
      </div>

      {/* Weekly Activity */}
      <div className="card-neo p-4 mt-3">
        <h5 className="fw-bold mb-3">Weekly Activity</h5>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valueA" fill="#00b4d8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="valueB" fill="#023e8a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

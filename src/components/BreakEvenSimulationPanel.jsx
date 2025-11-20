import React, { useState } from "react";
import { FiArrowLeft, FiPenTool } from "react-icons/fi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BreakEvenSimulationPanel({ client, setTab }) {
  const [price, setPrice] = useState(20);
  const [variableCost, setVariableCost] = useState(8);
  const [fixedCost, setFixedCost] = useState(1500);
  const [units, setUnits] = useState(200);

  const breakEvenUnits = Math.round(fixedCost / (price - variableCost));

  const chartData = Array.from({ length: 7 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    revenue: (i + 1) * price * 20,
    cost: fixedCost + variableCost * (i + 1) * 20,
  }));

  return (
    <div className="container-xxl">

      {/* Back button */}
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn btn-outline-secondary me-3"
          onClick={() => setTab("dashboard")}
        >
          <FiArrowLeft /> Back
        </button>

        <h3 className="fw-bold mb-0">
          Break-even Simulation — {client?.name}
        </h3>
      </div>

      {/* Inputs */}
      <div className="card-neo p-4 mb-4">
        <h5 className="fw-bold mb-3">Simulation Settings</h5>

        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label fw-semibold">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Variable Cost</label>
            <input
              type="number"
              value={variableCost}
              onChange={(e) => setVariableCost(Number(e.target.value))}
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Fixed Cost</label>
            <input
              type="number"
              value={fixedCost}
              onChange={(e) => setFixedCost(Number(e.target.value))}
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label fw-semibold">Units Sold</label>
            <input
              type="number"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Break-even result */}
      <div className="card-neo p-4 mb-4">
        <h5 className="fw-bold mb-3">Break-even Result</h5>

        <div className="alert alert-info fw-semibold">
          Estimated break-even point:
          <span className="text-primary"> {breakEvenUnits} units</span>
        </div>

        <div className="text-muted small">
          * This is a simplified simulation for display/demo purposes only.
        </div>
      </div>

      {/* Chart */}
      <div className="card-neo p-4 mb-4">
        <h5 className="fw-bold mb-3">Revenue vs Cost Trend</h5>

        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#28a745" strokeWidth={2} />
              <Line type="monotone" dataKey="cost" stroke="#dc3545" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* WRITE FEEDBACK BUTTON */}
      <div className="text-end mt-4">
        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          onClick={() => setTab("feedback")}
        >
          <FiPenTool size={16} />
          Write Feedback
        </button>
      </div>

    </div>
  );
}

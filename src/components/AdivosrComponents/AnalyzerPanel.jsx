import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export default function AnalyzerPanel() {
  const [client, setClient] = useState("Rakib");

  // -----------------------------
  // 🔵 بيانات كل عميل (مطابقة لأنواع رسوم البزنس أونر)
  // -----------------------------

  const data = {
    Rakib: {
      breakEven: [
        { units: 0, cost: 2000, revenue: 0 },
        { units: 50, cost: 2350, revenue: 1500 },
        { units: 100, cost: 2700, revenue: 3000 },
        { units: 150, cost: 3050, revenue: 4500 },
      ],
      pricing: [
        { price: "10 SAR", profit: 800 },
        { price: "12 SAR", profit: 1300 },
        { price: "14 SAR", profit: 1800 },
      ],
      cashflow: [
        { month: "Jan", inflow: 5000, outflow: 4200 },
        { month: "Feb", inflow: 5400, outflow: 4600 },
        { month: "Mar", inflow: 5800, outflow: 5100 },
      ],
      scenarios: [
        { name: "Scenario A", profit: 1500 },
        { name: "Scenario B", profit: 1900 },
      ],
    },

    Abrar: {
      breakEven: [
        { units: 0, cost: 1800, revenue: 0 },
        { units: 50, cost: 2100, revenue: 1200 },
        { units: 100, cost: 2400, revenue: 2400 },
        { units: 150, cost: 2700, revenue: 3600 },
      ],
      pricing: [
        { price: "9 SAR", profit: 400 },
        { price: "11 SAR", profit: 950 },
        { price: "13 SAR", profit: 1400 },
      ],
      cashflow: [
        { month: "Jan", inflow: 3000, outflow: 2900 },
        { month: "Feb", inflow: 3150, outflow: 3100 },
        { month: "Mar", inflow: 3300, outflow: 3250 },
      ],
      scenarios: [
        { name: "Scenario A", profit: 800 },
        { name: "Scenario B", profit: 1150 },
      ],
    },

    Norah: {
      breakEven: [
        { units: 0, cost: 2500, revenue: 0 },
        { units: 50, cost: 2850, revenue: 1700 },
        { units: 100, cost: 3200, revenue: 3400 },
        { units: 150, cost: 3550, revenue: 5100 },
      ],
      pricing: [
        { price: "12 SAR", profit: 700 },
        { price: "14 SAR", profit: 1400 },
        { price: "16 SAR", profit: 2100 },
      ],
      cashflow: [
        { month: "Jan", inflow: 4200, outflow: 4000 },
        { month: "Feb", inflow: 4700, outflow: 4300 },
        { month: "Mar", inflow: 5200, outflow: 4550 },
      ],
      scenarios: [
        { name: "Scenario A", profit: 1100 },
        { name: "Scenario B", profit: 1600 },
      ],
    },
  };

  const current = data[client];

  return (
    <div className="container-xxl">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Financial Analyzer</h4>

        <select
          className="form-select w-auto"
          value={client}
          onChange={(e) => setClient(e.target.value)}
        >
          <option>Rakib</option>
          <option>Abrar</option>
          <option>Norah</option>
        </select>
      </div>

      {/* ------------------------------------------------- */}
      {/* 1) BREAK-EVEN CHART */}
      {/* ------------------------------------------------- */}
      <div className="card-neo p-4 mb-4">
        <h5 className="fw-bold mb-3">Break-even Analysis</h5>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={current.breakEven}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="units" />
              <YAxis />
              <Tooltip />
              <Line dataKey="cost" stroke="#023e8a" strokeWidth={3} />
              <Line dataKey="revenue" stroke="#00b4d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ------------------------------------------------- */}
      {/* 2) PRICING SIMULATION */}
      {/* ------------------------------------------------- */}
      <div className="card-neo p-4 mb-4">
        <h5 className="fw-bold mb-3">Pricing Simulation</h5>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={current.pricing}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="price" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="profit" fill="#0077b6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ------------------------------------------------- */}
      {/* 3) CASHFLOW PROJECTION */}
      {/* ------------------------------------------------- */}
      <div className="card-neo p-4 mb-4">
        <h5 className="fw-bold mb-3">Cashflow Projection</h5>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={current.cashflow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="inflow" stroke="#0096c7" strokeWidth={3} />
              <Line dataKey="outflow" stroke="#d00000" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ------------------------------------------------- */}
      {/* 4) SCENARIO COMPARISON */}
      {/* ------------------------------------------------- */}
      <div className="card-neo p-4 mb-5">
        <h5 className="fw-bold mb-3">Scenario Comparison</h5>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={current.scenarios}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="profit" fill="#03045e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}

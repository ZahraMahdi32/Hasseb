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
  Bar
} from "recharts";

export default function AnalyzerPanel() {
  // ===============  DATA FOR ALL PERIODS  =================
  const dataSets = {
    "1D": [
      { date: "10 AM", price: 340 },
      { date: "12 PM", price: 342 },
      { date: "2 PM", price: 338 },
      { date: "4 PM", price: 344 },
    ],
    "1W": [
      { date: "Mon", price: 315 },
      { date: "Tue", price: 320 },
      { date: "Wed", price: 318 },
      { date: "Thu", price: 325 },
      { date: "Fri", price: 330 },
    ],
    "1M": [
      { date: "Feb 1", price: 305 },
      { date: "Feb 8", price: 315 },
      { date: "Feb 15", price: 318 },
      { date: "Feb 22", price: 329 },
      { date: "Feb 28", price: 342 },
    ],
    "3M": [
      { date: "Jan 1", price: 313.9 },
      { date: "Jan 15", price: 305.2 },
      { date: "Feb 1", price: 318.4 },
      { date: "Feb 20", price: 330.1 },
      { date: "Mar 5", price: 347.8 },
    ],
    "1Y": [
      { date: "Apr", price: 270 },
      { date: "Jun", price: 300 },
      { date: "Aug", price: 320 },
      { date: "Oct", price: 310 },
      { date: "Dec", price: 345 },
    ],
  };

  // Selected period state
  const [period, setPeriod] = useState("3M");

  // Chart data based on selected period
  const chartData = dataSets[period];

  return (
    <div className="container-xxl">

      {/* =====================  METRIC CARDS  ===================== */}
      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card-neo p-3">
            <h6>Current Stock Price</h6>
            <h3>$342.87</h3>
            <span className="text-success">+2.4%</span>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card-neo p-3">
            <h6>Daily Change</h6>
            <h3>+8.23</h3>
            <span className="text-success">+2.4%</span>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card-neo p-3">
            <h6>Market Trend</h6>
            <h3>Bullish</h3>
            <small className="text-success">↑ 7 day trend</small>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card-neo p-3">
            <h6>Sentiment Score</h6>
            <h3>0.73</h3>
            <small className="text-success">Positive</small>
          </div>
        </div>
      </div>

      {/* =====================  PRICE CHART SECTION  ===================== */}
      <div className="card-neo p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>AAPL - Historical & Live Stock Prices</h5>

          {/* Period buttons */}
          <div className="d-flex gap-2">
            {["1D", "1W", "1M", "3M", "1Y"].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`btn btn-sm ${period === p ? "btn-dark" : "btn-outline-dark"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#000" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <small className="text-muted mt-2 d-block">
          Last updated: {new Date().toLocaleString()}
        </small>
      </div>

      {/* =====================  EXTRA CHART #1  ===================== */}
      <div className="card-neo p-4 mb-4">
        <h5 className="mb-3">Model Accuracy Comparison</h5>

        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <BarChart data={[
              { model: "Model A", acc: 95 },
              { model: "Model B", acc: 88 },
              { model: "Model C", acc: 91 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="acc" fill="#000" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =====================  EXTRA CHART #2 (اختياري) ===================== */}
      <div className="card-neo p-4">
        <h5 className="mb-3">Volatility Index</h5>

        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <LineChart data={[
              { period: "Week 1", vol: 20 },
              { period: "Week 2", vol: 25 },
              { period: "Week 3", vol: 22 },
              { period: "Week 4", vol: 30 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="vol" stroke="#00b4d8" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

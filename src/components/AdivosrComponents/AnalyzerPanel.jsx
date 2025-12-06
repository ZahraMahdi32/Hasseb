// src/components/AdivosrComponents/AnalyzerPanel.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AnalyzerPanel({ advisorId }) {
  const [owners, setOwners] = useState([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState("");
  const [businessData, setBusinessData] = useState(null);
  const [loadingOwnerData, setLoadingOwnerData] = useState(false);
  const [loadingOwners, setLoadingOwners] = useState(true);

  // ================================
  // 1) GET OWNERS FROM DASHBOARD
  // ================================
  useEffect(() => {
    if (!advisorId) return;

    const fetchOwners = async () => {
      try {
        setLoadingOwners(true);
        const res = await axios.get(
          `http://localhost:5001/api/advisor/dashboard/${advisorId}`
        );

        const ownersList = res.data?.owners || [];
        setOwners(ownersList);

        if (ownersList.length > 0) {
          setSelectedOwnerId(ownersList[0]._id);
        }
      } catch (err) {
        console.error("Error fetching owners", err);
      } finally {
        setLoadingOwners(false);
      }
    };

    fetchOwners();
  }, [advisorId]);

  // ================================
  // 2) GET BUSINESS DATA DIRECTLY
  // ================================
  useEffect(() => {
    if (!selectedOwnerId) return;

    const fetchBusinessData = async () => {
      try {
        setLoadingOwnerData(true);

        const res = await axios.get(
          `http://localhost:5001/api/business-data/owner/${selectedOwnerId}`
        );

        setBusinessData(res.data?.data || null);
      } catch (err) {
        console.log("Error loading business data", err);
        setBusinessData(null);
      } finally {
        setLoadingOwnerData(false);
      }
    };

    fetchBusinessData();
  }, [selectedOwnerId]);

  // ================================
  // BUILD CHART SERIES
  // ================================
  const cashSeries =
    businessData?.cashFlow?.map((row, idx) => ({
      label: row.date || `Entry ${idx + 1}`,
      value:
        typeof row.netCashFlow === "number"
          ? row.netCashFlow
          : (row.cashIn || 0) - (row.cashOut || 0),
    })) || [];

  const maxAbsCash =
    cashSeries.length > 0
      ? Math.max(...cashSeries.map((x) => Math.abs(x.value)))
      : 1;

  const scenarioSeries =
    businessData?.pricingScenarios?.map((s) => {
      const profit =
        typeof s.profit === "number"
          ? s.profit
          : (s.revenue || 0) -
            (s.variableCost || 0) -
            (businessData?.fixedCost || 0);

      return { label: s.scenario, profit };
    }) || [];

  const maxAbsProfit =
    scenarioSeries.length > 0
      ? Math.max(...scenarioSeries.map((x) => Math.abs(x.profit)))
      : 1;

  const products = businessData?.products || [];
  const fixedCost = businessData?.fixedCost || 0;

  // ================================
  // RENDER
  // ================================
  return (
    <div className="support-container">
      <h1 className="support-title">Analyzer</h1>

      {/* OWNER SELECT */}
      <div className="support-card">
        <div className="ticket-form">
          <div className="form-row">
            <label className="form-label">Select Owner</label>
            <select
              className="ticket-input"
              value={selectedOwnerId}
              onChange={(e) => setSelectedOwnerId(e.target.value)}
            >
              {owners.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.fullName || o.username}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BUSINESS SUMMARY */}
      {loadingOwnerData ? (
        <p style={{ marginTop: "1rem" }}>Loading business data...</p>
      ) : businessData ? (
        <>
          {/* SUMMARY CARDS */}
          <div className="support-card" style={{ marginTop: "1rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                gap: "1rem",
              }}
            >
              <div className="ticket-item" style={{ boxShadow: "none" }}>
                <div className="ticket-title">Products</div>
                <div className="ticket-date">
                  {products.length} items
                </div>
              </div>

              <div className="ticket-item" style={{ boxShadow: "none" }}>
                <div className="ticket-title">Fixed Cost</div>
                <div className="ticket-date">{fixedCost} SAR</div>
              </div>

              <div className="ticket-item" style={{ boxShadow: "none" }}>
                <div className="ticket-title">Cash Entries</div>
                <div className="ticket-date">{cashSeries.length}</div>
              </div>
            </div>
          </div>

          {/* CASH FLOW CHART */}
          <div className="support-card" style={{ marginTop: "1.5rem" }}>
            <h2 className="section-title">Cash Flow Trend</h2>

            {cashSeries.length === 0 ? (
              <p className="empty-state">No cash flow data.</p>
            ) : (
              cashSeries.map((c) => {
                const widthPct = Math.max(
                  5,
                  (Math.abs(c.value) / maxAbsCash) * 100
                );

                return (
                  <div
                    key={c.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                      marginBottom: ".4rem",
                    }}
                  >
                    <span style={{ width: "100px", fontSize: ".8rem" }}>
                      {c.label}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        background: "#eee",
                        height: "8px",
                        borderRadius: "50px",
                      }}
                    >
                      <div
                        style={{
                          width: `${widthPct}%`,
                          height: "8px",
                          background: c.value >= 0 ? "#16a34a" : "#dc2626",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        width: "80px",
                        fontSize: ".75rem",
                        textAlign: "right",
                      }}
                    >
                      {c.value}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* PRICING SCENARIOS */}
          <div className="support-card" style={{ marginTop: "1.5rem" }}>
            <h2 className="section-title">Pricing Scenarios</h2>

            {scenarioSeries.length === 0 ? (
              <p className="empty-state">No pricing scenario data.</p>
            ) : (
              scenarioSeries.map((s) => {
                const widthPct = Math.max(
                  5,
                  (Math.abs(s.profit) / maxAbsProfit) * 100
                );

                return (
                  <div
                    key={s.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                      marginBottom: ".4rem",
                    }}
                  >
                    <span style={{ width: "130px", fontSize: ".8rem" }}>
                      {s.label}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        background: "#eee",
                        height: "8px",
                        borderRadius: "50px",
                      }}
                    >
                      <div
                        style={{
                          width: `${widthPct}%`,
                          height: "8px",
                          background: s.profit >= 0 ? "#2563eb" : "#dc2626",
                        }}
                      />
                    </div>

                    <span
                      style={{
                        width: "80px",
                        fontSize: ".8rem",
                        textAlign: "right",
                      }}
                    >
                      {s.profit}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* PRODUCTS TABLE */}
          <div className="support-card" style={{ marginTop: "1.5rem" }}>
            <h2 className="section-title">Products</h2>

            {products.length === 0 ? (
              <p className="empty-state">No products found.</p>
            ) : (
              <ul style={{ paddingLeft: "1rem" }}>
                {products.map((p) => (
                  <li key={p._id || p.name}>{p.name}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : (
        <p style={{ marginTop: "1rem" }}>No business data found.</p>
      )}
    </div>
  );
}

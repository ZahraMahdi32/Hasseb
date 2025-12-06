// =============================================================
// RecommendationsPanel.jsx — FULL WORKING VERSION
// =============================================================
import React, { useEffect, useState } from "react";
import "../businessOwner/ScenarioComparison.css";
import "./RecommendationsPanel.css";

export default function RecommendationsPanel({ setTab }) {
  const user = JSON.parse(localStorage.getItem("loggedUser"));
  const advisorId = user?.userId;

  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [scenarios, setScenarios] = useState([]);

  const [recommendations, setRecommendations] = useState({});
  const [loadingScenarios, setLoadingScenarios] = useState(false);

  // ============================================================
  // LOAD OWNERS LINKED TO ADVISOR
  // ============================================================
  useEffect(() => {
    async function loadOwners() {
      try {
        const res = await fetch(
          `http://localhost:5001/api/advisor/owners/${advisorId}`
        );
        const data = await res.json();

        if (data.success) {
          setOwners(data.owners);
        }
      } catch (err) {
        console.error("Owners error:", err);
      }
    }

    loadOwners();
  }, [advisorId]);

  // ============================================================
  // LOAD SCENARIOS FOR OWNER → using username
  // ============================================================
  const loadOwnerScenarios = async (owner) => {
    if (!owner) return;

    setLoadingScenarios(true);
    setScenarios([]);

    try {
      const username = owner.username; 
      const res = await fetch(
        `http://localhost:5001/api/pricing-scenarios/${username}`
      );

      const data = await res.json();

      if (data.success) {
        setScenarios(data.scenarios || []);
      }
    } catch (err) {
      console.error("Scenario fetch error:", err);
    }

    setLoadingScenarios(false);
  };

  // ============================================================
  // METRICS HELPERS (COPY FROM ScenarioComparison.jsx)
  // ============================================================
  function buildMetrics(s) {
    const price = Number(s.newPrice || 0);
    const variableCost = Number(s.variableCost || 0);
    const fixedCostPerUnit = Number(s.fixedCostPerUnit || 0);

    const totalRevenue = Number(s.totalRevenue || 0);
    const totalProfit = Number(s.totalProfit || 0);
    const profitPerUnit = Number(s.profitPerUnit || 0);
    const profitMargin = Number(s.profitMargin || 0);

    return {
      price,
      variableCost,
      fixedCostPerUnit,
      totalRevenue,
      totalProfit,
      profitPerUnit,
      profitMargin,
    };
  }

  function classifyMargin(margin) {
    if (margin < 0) return { label: "Loss-making", risk: "critical" };
    if (margin < 10) return { label: "Dangerously thin", risk: "high" };
    if (margin < 15) return { label: "Low safety", risk: "elevated" };
    if (margin < 30) return { label: "Healthy", risk: "normal" };
    if (margin < 40) return { label: "Strong", risk: "low" };
    return { label: "Excellent", risk: "very-low" };
  }

  function runStressTest(m) {
    const marginFor = (multiplier) => {
      const newVarCost = m.variableCost * multiplier;
      const profitUnit = m.price - newVarCost - m.fixedCostPerUnit;
      const marginPct = m.price > 0 ? (profitUnit / m.price) * 100 : 0;
      return marginPct;
    };

    return {
      marginPlus10: marginFor(1.1),
      marginPlus20: marginFor(1.2),
    };
  }

  function riskScore(margin, stress) {
    let score = 0;

    if (margin < 5) score += 0.8;
    else if (margin < 10) score += 0.6;
    else if (margin < 15) score += 0.4;
    else if (margin < 25) score += 0.2;
    else score += 0.1;

    if (stress.marginPlus20 < 0) score += 0.2;
    else if (stress.marginPlus20 < 5) score += 0.15;
    else if (stress.marginPlus20 < 10) score += 0.1;

    return Math.min(1, score);
  }

  // ============================================================
  // SEND RECOMMENDATION
  // ============================================================
  const sendRecommendation = async (scenarioId) => {
    const text = recommendations[scenarioId];
    if (!text?.trim()) return;

    try {
      const res = await fetch(
        "http://localhost:5001/api/advisor/recommendations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            advisorId,
            ownerId: selectedOwner._id,
            scenarioId,
            text,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        alert("Recommendation sent!");
        setRecommendations((prev) => ({ ...prev, [scenarioId]: "" }));
      }
    } catch (err) {
      console.error("Send recommendation error:", err);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="scenario-wrapper">
      <h2 className="scenario-title">Recommendations</h2>

      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => setTab("dashboard")}>
        ← Back
      </button>

      {/* OWNER DROPDOWN */}
      <div className="selector-box">
        <label>Select Owner</label>
        <select
          value={selectedOwner?._id || ""}
          onChange={(e) => {
            const owner = owners.find((o) => o._id === e.target.value);
            setSelectedOwner(owner);
            loadOwnerScenarios(owner);
          }}
        >
          <option value="">Choose Owner</option>
          {owners.map((o) => (
            <option key={o._id} value={o._id}>
              {o.fullName || o.username}
            </option>
          ))}
        </select>
      </div>

      {/* SCENARIO CARDS */}
      {loadingScenarios ? (
        <p>Loading scenarios...</p>
      ) : scenarios.length === 0 ? (
        <p>No scenarios available.</p>
      ) : (
        <div className="scenario-list">
          {scenarios.map((s) => {
            const m = buildMetrics(s);
            const marginClass = classifyMargin(m.profitMargin);
            const stress = runStressTest(m);
            const risk = riskScore(m.profitMargin, stress);

            return (
              <div key={s._id} className="scenario-card">
                <div className="scenario-card-header">
                  <div className="scenario-product">
                    {s.productName} — {m.price.toFixed(2)} SAR
                  </div>

                  <div className="scenario-tags">
                    <span className="tag">{marginClass.label}</span>
                    {m.totalProfit > 0 && (
                      <span className="tag tag--profit">Profitable</span>
                    )}
                  </div>
                </div>

                <div className="scenario-details">
                  <span>
                    Profit: <strong>{m.totalProfit.toFixed(2)} SAR</strong>
                  </span>
                  <span>
                    Margin:{" "}
                    <strong>
                      {m.profitMargin.toFixed(1)}% ({marginClass.label})
                    </strong>
                  </span>
                  <span>
                    Revenue:{" "}
                    <strong>{m.totalRevenue.toFixed(2)} SAR</strong>
                  </span>
                </div>

                {/* Recommendation Input */}
                <textarea
                  className="rec-textarea"
                  placeholder="Write your recommendation..."
                  value={recommendations[s._id] || ""}
                  onChange={(e) =>
                    setRecommendations({
                      ...recommendations,
                      [s._id]: e.target.value,
                    })
                  }
                />

                <button
                  className="rec-send-btn"
                  onClick={() => sendRecommendation(s._id)}
                >
                  Send Recommendation
                </button>

                {/* Risk Meter */}
                <div className="risk-meter">
                  <div className="risk-meter-label">Risk level</div>
                  <div className="risk-meter-bar">
                    <div
                      className={
                        "risk-meter-fill " +
                        (risk > 0.7
                          ? "risk-meter-fill--high"
                          : risk > 0.4
                          ? "risk-meter-fill--medium"
                          : "risk-meter-fill--low")
                      }
                      style={{ width: `${risk * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

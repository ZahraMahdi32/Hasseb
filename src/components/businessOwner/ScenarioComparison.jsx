import React, { useEffect, useState } from "react";
import "./ScenarioComparison.css";

export default function ScenarioComparison({ username }) {
    const [scenarios, setScenarios] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        async function loadScenarios() {
            try {
                const logged = JSON.parse(localStorage.getItem("loggedUser"));
                const ownerId = logged?.userId;

                const res = await fetch(`http://localhost:5001/api/business-data/scenarios/owner/${ownerId}`);


                const data = await res.json();

                if (!data.success) {
                    throw new Error("No scenarios found");
                }

                setScenarios(data.scenarios);
            } catch (e) {
                console.error(e);
                setError("No scenarios found.");
            } finally {
                setLoading(false);
            }
        }

        loadScenarios();
    }, []);


    function toggleSelection(id) {
        setSelectedIds((prev) => {
            if (prev.includes(id)) return prev.filter((x) => x !== id);
            if (prev.length >= 2) return prev;
            return [...prev, id];
        });
    }

    const selectedScenarios = selectedIds
        .map((id) => scenarios.find((s) => s._id === id))
        .filter(Boolean);

    // ---------------- METRICS & HELPERS ----------------

    function buildMetrics(scenario) {
        if (scenario.breakEvenUnits !== undefined) {
            const price = Number(scenario.newPrice || 0);
            const variableCost = Number(scenario.variableCost || 0);
            const units = Number(scenario.breakEvenUnits || 0);
            const fixedCostPerUnit = Number(scenario.fixedCostPerUnit || 0);

            const totalRevenue = Number(scenario.breakEvenSales || price * units || 0);
            const totalProfit = Number(scenario.totalProfit || 0);
            const profitPerUnit = units > 0 ? totalProfit / units : 0;
            const profitMargin =
                totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

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

        return {
            price: Number(scenario.newPrice || 0),
            variableCost: Number(scenario.variableCost || 0),
            fixedCostPerUnit: Number(scenario.fixedCostPerUnit || 0),
            totalRevenue: Number(scenario.totalRevenue || 0),
            totalProfit: Number(scenario.totalProfit || 0),
            profitPerUnit: Number(scenario.profitPerUnit || 0),
            profitMargin: Number(scenario.profitMargin || 0),
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

    function runStressTest(metrics) {
        const { price, variableCost, fixedCostPerUnit } = metrics;

        function marginFor(multiplier) {
            const newVar = variableCost * multiplier;
            const profitUnit = price - newVar - fixedCostPerUnit;
            return price > 0 ? (profitUnit / price) * 100 : 0;
        }

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

    async function handleSaveScenarioCopy(scenario) {
        try {
            const user = JSON.parse(localStorage.getItem("loggedUser"));
            if (!user) return alert("User not found.");

            const payload = {
                username: user.username,
                productName: scenario.productName,
                newPrice: scenario.newPrice,
                variableCost: scenario.variableCost,
                fixedCostPerUnit: scenario.fixedCostPerUnit,
                totalRevenue: scenario.totalRevenue,
                totalProfit: scenario.totalProfit,
                profitPerUnit: scenario.profitPerUnit,
                profitMargin: scenario.profitMargin,
                sourceScenarioId: scenario._id,
                timestamp: Date.now(),
            };

            const res = await fetch("http://localhost:5001/api/pricing-scenarios/save-copy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            alert("Scenario saved!");

        } catch (err) {
            console.error(err);
            alert("Failed to save scenario.");
        }
    }

    // ---------------- UI ----------------

    if (loading) {
        return (
            <div className="scenario-wrapper">
                <h2 className="scenario-title">Pricing Scenarios</h2>
                <p>Loading scenarios...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="scenario-wrapper">
                <h2 className="scenario-title">Pricing Scenarios</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="scenario-wrapper">
            <h2 className="scenario-title">Pricing Scenarios</h2>

            <div className="scenario-list">
                {scenarios.map((s) => {
                    const isSelected = selectedIds.includes(s._id);

                    const m = buildMetrics(s);
                    const marginClass = classifyMargin(m.profitMargin);
                    const stress = runStressTest(m);
                    const risk = riskScore(m.profitMargin, stress);

                    const scenarioRecs = recommendations.filter(r => r.scenarioId === s._id);

                    return (
                        <div
                            key={s._id}
                            className={"scenario-card" + (isSelected ? " selected" : "")}
                            onClick={() => toggleSelection(s._id)}
                        >
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
                                <span>Profit: <strong>{m.totalProfit.toFixed(2)} SAR</strong></span>
                                <span>Margin: <strong>{m.profitMargin.toFixed(1)}%</strong></span>
                                <span>Revenue: <strong>{m.totalRevenue.toFixed(2)} SAR</strong></span>
                            </div>

                            <div className="scenario-recommendation-card">
                                <h4 className="rec-title">Advisor Recommendations</h4>

                                {scenarioRecs.length === 0 ? (
                                    <p className="rec-empty">No recommendations yet.</p>
                                ) : (
                                    <ul className="rec-list">
                                        {scenarioRecs.map((r) => (
                                            <li key={r._id} className="rec-item">
                                                <p>{r.text}</p>
                                                <small className="rec-date">
                                                    {new Date(r.createdAt).toLocaleString()}
                                                </small>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

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

                            <button
                                type="button"
                                className="scenario-save-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveScenarioCopy(s);
                                }}
                            >
                                Save Scenario
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

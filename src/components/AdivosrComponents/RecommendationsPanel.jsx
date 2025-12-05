import React, { useState, useEffect } from "react";
import axios from "axios";
import AnalyzerPanel from "./AnalyzerPanel.jsx";

export default function RecommendationsPanel({ owners, advisorId }) {
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [text, setText] = useState("");

  // fetch recommendations for selected owner
  const loadRecommendations = async (ownerId) => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/advisor/suggestions/${ownerId}`
      );
      setRecommendations(res.data || []);
    } catch (err) {
      console.log("Error loading recs:", err);
    }
  };

  // when selecting owner
  const handleSelect = (owner) => {
    setSelectedOwner(owner);
    setOwnerData(owner.businessData || null);
    loadRecommendations(owner._id);
  };

  const sendRecommendation = async () => {
    if (!text.trim()) return;

    try {
      await axios.post("http://localhost:5001/api/advisor/suggestions", {
        advisorId,
        ownerId: selectedOwner._id,
        suggestion: { text },
      });

      setText("");
      loadRecommendations(selectedOwner._id);
      alert("Recommendation sent!");
    } catch (err) {
      console.log("Error sending rec:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="fw-bold mb-3">Recommendations</h2>

      <div className="d-flex gap-4">

        {/* Owners list */}
        <div className="col-3 bg-white shadow p-3 rounded">
          <h5 className="fw-bold mb-2">Owners</h5>

          {owners.map((o) => (
            <div
              key={o._id}
              className={`p-2 rounded mb-2 border ${
                selectedOwner?._id === o._id ? "bg-light border-primary" : ""
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => handleSelect(o)}
            >
              <p className="m-0 fw-bold">{o.fullName}</p>
              <p className="small text-muted">{o.username}</p>
            </div>
          ))}
        </div>

        {/* Owner details + analyzer + recommendations */}
        <div className="col-9">

          {!selectedOwner ? (
            <div className="text-muted mt-5">Select an owner to view details.</div>
          ) : (
            <div>

              {/* Business Data */}
              <div className="bg-white shadow p-3 rounded mb-4">
                <h4 className="fw-bold mb-3">
                  {selectedOwner.fullName}'s Business
                </h4>

                {!ownerData ? (
                  <p className="text-danger">No business data available.</p>
                ) : (
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Fixed Cost:</strong> {ownerData.fixedCost}</p>
                      <p><strong>Variable Cost:</strong> {ownerData.variableCost}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Price per Unit:</strong> {ownerData.pricePerUnit}</p>
                      <p><strong>Avg Units:</strong> {ownerData.avgMonthlyUnits}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Analyzer */}
              <AnalyzerPanel businessData={ownerData} />

              {/* Write Recommendation */}
              <div className="bg-white shadow p-3 rounded mt-4">
                <h5 className="fw-bold mb-2">Write Recommendation</h5>

                <textarea
                  className="form-control"
                  rows="4"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type recommendation here..."
                ></textarea>

                <button
                  className="btn btn-primary mt-2"
                  onClick={sendRecommendation}
                >
                  Submit
                </button>
              </div>

              {/* Previous Recommendations */}
              <div className="bg-white shadow p-3 rounded mt-4">
                <h5 className="fw-bold mb-2">Previous Recommendations</h5>

                {recommendations.length === 0 ? (
                  <p className="text-muted">No recommendations yet.</p>
                ) : (
                  recommendations.map((rec) => (
                    <div
                      key={rec._id}
                      className="p-2 border rounded mb-2 bg-light"
                    >
                      <p className="m-0">{rec.suggestion?.text}</p>
                      <span className="text-muted small">
                        {new Date(rec.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

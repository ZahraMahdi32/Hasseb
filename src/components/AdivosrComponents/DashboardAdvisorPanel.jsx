import React, { useState, useEffect } from "react";
import axios from "axios";
import AnalyzerPanel from "./AnalyzerPanel.jsx";

export default function DashboardAdvisorPanel({ advisorId }) {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [recommendationText, setRecommendationText] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ================================
  // FETCH OWNERS ONLY (NOT FEEDBACK)
  // ================================
  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/advisor/dashboard/${advisorId}`
      );

      console.log("DASHBOARD OWNERS:", res.data.owners);

      setOwners(res.data.owners || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
  };

  const handleSelectOwner = (owner) => {
    setSelectedOwner(owner);
    setOwnerData(owner.businessData || null);
  };

  const submitRecommendation = async () => {
    if (!recommendationText.trim() || !selectedOwner) return;

    try {
      await axios.post("http://localhost:5001/api/advisor/suggestions", {
        advisorId,
        ownerId: selectedOwner._id,
        suggestion: { text: recommendationText },
      });

      alert("Recommendation sent!");
      setRecommendationText("");
    } catch (err) {
      console.error("Error sending recommendation:", err);
    }
  };

  // ================================
  // UI
  // ================================
  return (
    <div className="p-5 flex gap-6">

      {/* LEFT: OWNERS LIST */}
      <div className="w-1/3 bg-white shadow p-4 rounded-xl">
        <h2 className="text-xl font-semibold mb-3">Your Owners</h2>

        {owners.length === 0 && (
          <p className="text-gray-500">No owners assigned yet.</p>
        )}

        {owners.map((owner) => (
          <div
            key={owner._id}
            onClick={() => handleSelectOwner(owner)}
            className={`p-3 border rounded-lg mb-2 cursor-pointer transition ${
              selectedOwner?._id === owner._id
                ? "bg-blue-100 border-blue-600"
                : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <p className="font-bold">{owner.fullName}</p>
            <p className="text-gray-500 text-sm">{owner.username}</p>
          </div>
        ))}
      </div>

      {/* RIGHT: OWNER DETAILS */}
      <div className="w-2/3">

        {!selectedOwner ? (
          <div className="text-gray-600 text-center mt-20">
            Select an owner to view details.
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {selectedOwner.fullName} — Business Overview
            </h2>

            {!ownerData ? (
              <p className="text-red-500">
                This owner has not uploaded business data.
              </p>
            ) : (
              <div className="bg-white shadow rounded-xl p-4 mb-5">
                <h3 className="font-semibold text-lg mb-2">Business Data</h3>

                <div className="grid grid-cols-2 gap-3">
                  <p><strong>Fixed Cost:</strong> {ownerData.fixedCost}</p>
                  <p><strong>Variable Cost Per Unit:</strong> {ownerData.products?.[0]?.variableCostPerUnit}</p>
                  <p><strong>Price Per Unit:</strong> {ownerData.products?.[0]?.pricePerUnit}</p>
                  <p><strong>Avg Units:</strong> {ownerData.avgMonthlyUnits}</p>
                </div>
              </div>
            )}

            <AnalyzerPanel businessData={ownerData} />

            {/* RECOMMENDATION BOX */}
            <div className="bg-white shadow p-4 rounded-xl mt-6">
              <h3 className="font-semibold mb-2">Write Recommendation</h3>

              <textarea
                value={recommendationText}
                onChange={(e) => setRecommendationText(e.target.value)}
                rows={4}
                className="w-full border rounded-lg p-2"
              />

              <button
                onClick={submitRecommendation}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Submit Recommendation
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

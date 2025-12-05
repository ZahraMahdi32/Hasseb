import React from "react";

export default function AnalyzerPanel({ businessData }) {
  if (!businessData)
    return (
      <div className="text-gray-500 mt-5">No data available for analysis.</div>
    );

  const { fixedCost, variableCost, pricePerUnit, avgMonthlyUnits } =
    businessData;

  const contribution = pricePerUnit - variableCost;
  const breakEvenUnits = Math.ceil(fixedCost / contribution);
  const profit =
    avgMonthlyUnits > breakEvenUnits
      ? (avgMonthlyUnits - breakEvenUnits) * contribution
      : 0;

  return (
    <div className="bg-white shadow p-5 rounded-xl mt-5">
      <h3 className="text-xl font-semibold mb-3">Analyzer</h3>

      <div className="grid grid-cols-2 gap-3">
        <p><strong>Break-Even Units:</strong> {breakEvenUnits}</p>
        <p><strong>Contribution Margin:</strong> {contribution}</p>
        <p><strong>Expected Monthly Profit:</strong> {profit}</p>
      </div>
    </div>
  );
}

const mongoose = require("mongoose");

const pricingScenarioSchema = new mongoose.Schema(
  {
    ownerId: { type: String, required: true },   // switched from username → ownerId

    productId: { type: String, required: true },
    productName: { type: String, required: true },

    newPrice: { type: Number, required: true },
    variableCost: { type: Number, required: true },
    fixedCostPerUnit: { type: Number, required: true },

    profitPerUnit: { type: Number, required: true },
    profitMargin: { type: Number, required: true },
    totalProfit: { type: Number, required: true },
    totalRevenue: { type: Number, required: true },

    timestamp: { type: Date, default: Date.now },
  },
  {
    collection: "pricingSenarios", // keeping original collection name
  }
);

module.exports = mongoose.model("PricingScenario", pricingScenarioSchema);

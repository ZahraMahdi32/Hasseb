// models/BusinessData.js
const mongoose = require("mongoose");

/* ===========================
   CASH FLOW SCHEMA
=========================== */
const CashFlowRowSchema = new mongoose.Schema(
  {
    date: String,
    description: String,
    cashIn: Number,
    cashOut: Number,
    netCashFlow: Number,
    runningBalance: Number,
  },
  { _id: false }
);

/* ===========================
   PRODUCT (Contribution Margin)
   -> Option B field names
=========================== */
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: String, default: "" }, // Premium / Standard

    pricePerUnit: { type: Number, default: 0 },
    variableCostPerUnit: { type: Number, default: 0 },

    fixedCosts: { type: Number, default: 0 },
    cm: { type: Number, default: 0 },

    breakEvenUnits: { type: Number, default: 0 },
    breakEvenSar: { type: Number, default: 0 },
  },
  { _id: true }
);

/* ===========================
   PRICING SENSITIVITY SCHEMA
=========================== */
const PricingScenarioSchema = new mongoose.Schema(
  {
    scenario: String,
    price: Number,
    unitsSold: Number,
    revenue: Number,
    variableCost: Number,
    cm: Number,
    profit: Number,
  },
  { _id: true }
);

/* ===========================
   BREAK-EVEN USER SCENARIOS
   (saved from BreakEvenCalculator)
=========================== */
const BreakEvenScenarioSchema = new mongoose.Schema(
  {
    productName: String,
    scenarioName: String,
    description: String,
    notes: String,
    tag: { type: String, default: "Break-Even" },

    fixedCost: Number,
    variableCostPerUnit: Number,
    pricePerUnit: Number,

    cmPerUnit: Number,
    cmRatio: Number, // percentage

    breakEvenUnits: Number,
    breakEvenSales: Number,

    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

/* ===========================
   MAIN BUSINESS DATA MODEL
=========================== */
const BusinessDataSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
    },

    businessName: { type: String, default: "" },

    products: [ProductSchema],

    cashFlow: [CashFlowRowSchema],

    pricingScenarios: [PricingScenarioSchema],

    // main fixed cost used by BEP / Pricing tools
    fixedCost: { type: Number, default: 0 },

    // user-defined break-even scenarios
    scenarios: [BreakEvenScenarioSchema],
  },

  { timestamps: true }
);

module.exports = mongoose.model("BusinessData", BusinessDataSchema);

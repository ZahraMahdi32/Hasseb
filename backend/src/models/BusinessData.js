const mongoose = require("mongoose");

/* ===========================
   CASH FLOW SCHEMA
=========================== */
const CashFlowRowSchema = new mongoose.Schema({
  date: String,
  description: String,
  cashIn: Number,
  cashOut: Number,
  netCashFlow: Number,
  runningBalance: Number
});

/* ===========================
   PRODUCT (Contribution Margin)
=========================== */
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  variableCost: Number,
  fixedCost: Number,
  contributionMargin: Number,
  breakEvenUnits: Number,
  breakEvenSAR: Number
});

/* ===========================
   PRICING SENSITIVITY SCHEMA
=========================== */
const PricingScenarioSchema = new mongoose.Schema({
  scenario: String,
  price: Number,
  unitsSold: Number,
  revenue: Number,
  variableCost: Number,
  cm: Number,
  profit: Number
});

/* ===========================
   MAIN BUSINESS DATA MODEL
=========================== */
const BusinessDataSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true
    },

    businessName: { type: String, default: "" },

    products: [ProductSchema],

    cashFlow: [CashFlowRowSchema],

    pricingScenarios: [PricingScenarioSchema],

    fixedCost: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessData", BusinessDataSchema);

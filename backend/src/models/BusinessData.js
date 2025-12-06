const mongoose = require("mongoose");

const BusinessDataSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: false,
      default: null
    },

    businessName: { type: String, default: "" },

    products: [
      {
        name: String,
        price: Number,
        variableCost: Number,
        fixedCost: Number,
        avgUnits: Number
      }
    ],

    fixedCost: { type: Number, default: 0 },

    cashFlow: [
      {
        month: String,
        inflow: Number,
        outflow: Number
      }
    ],

    pricingScenarios: [
      {
        scenario: String,
        price: Number,
        units: Number
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessData", BusinessDataSchema);

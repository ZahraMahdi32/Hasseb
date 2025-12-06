const mongoose = require("mongoose");

const OwnerSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  businessName: String,

  // ⭐ ADD USERNAME HERE
  username: {
    type: String,
    required: true,
    unique: true,
  },

  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Advisor",
    default: null,
  },

  businessData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BusinessData",
    default: null,
  },

  /* ============================
     FINANCIAL FIELDS
  ============================ */
  revenue: { type: Number, default: 0 },
  expenses: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  fixedCosts: { type: Number, default: 0 },
  variableCost: { type: Number, default: 0 },
  pricePerUnit: { type: Number, default: 0 },
  salesVolume: { type: Number, default: 0 },
  demand: { type: Number, default: 0 },
  cashOnHand: { type: Number, default: 0 },

  monthlyRevenue: { type: Number, default: 0 },
  monthlyExpenses: { type: Number, default: 0 },

  /* ============================
     FEEDBACK
  ============================ */
  feedback: [
    {
      content: String,
      createdAt: { type: Date, default: Date.now },
      advisorId: { type: mongoose.Schema.Types.ObjectId, ref: "Advisor" },
    },
  ],

  /* ============================
     TICKETS
  ============================ */
  tickets: [
    {
      title: String,
      description: String,
      status: { type: String, default: "open" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Owner", OwnerSchema);

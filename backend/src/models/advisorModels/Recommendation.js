const mongoose = require("mongoose");

const RecommendationSchema = new mongoose.Schema(
  {
    advisorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    scenarioId: { type: mongoose.Schema.Types.ObjectId, required: true }, // مهم جداً

    text: {
      type: String,
      required: true,
      trim: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recommendation", RecommendationSchema);

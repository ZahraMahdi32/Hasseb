const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
  {
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true
    },

    advisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advisor",
      required: true
    },

    notes: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: ["assigned", "active", "completed"],
      default: "assigned"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);

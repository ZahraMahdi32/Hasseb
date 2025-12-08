const express = require("express");
const router = express.Router();

// Load updated model
const PricingScenario = require("../models/scenario.js");

// ===============================
//  CREATE SCENARIO
// ===============================
router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    // Validate: ownerId must exist
    if (!payload.ownerId) {
      return res.status(400).json({
        success: false,
        message: "ownerId is required",
      });
    }

    const scenario = await PricingScenario.create(payload);

    return res.status(201).json({
      success: true,
      message: "Scenario saved successfully",
      scenario,
    });
  } catch (err) {
    console.error("🔥 Error saving pricing scenario:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to save scenario",
    });
  }
});

// ===============================
//  GET SCENARIOS BY OWNER ID
// ===============================
router.get("/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    const scenarios = await PricingScenario.find({ ownerId }).sort({
      timestamp: -1,
    });

    return res.json({
      success: true,
      scenarios,
    });
  } catch (err) {
    console.error("🔥 Error fetching pricing scenarios:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch scenarios",
    });
  }
});

module.exports = router;

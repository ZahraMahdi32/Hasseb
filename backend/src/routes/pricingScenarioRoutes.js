// src/routes/pricingScenarioRoutes.js
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Owner = require("../models/Owner");
const BusinessData = require("../models/BusinessData");

/* ============================================================
   SAVE SCENARIO (Break-even or Pricing)
============================================================ */
router.post("/save", async (req, res) => {
  try {
    const {
      username,
      productName,
      pricePerUnit,
      variableCostPerUnit,
      fixedCost,
      breakEvenUnits,
      breakEvenSales,
      scenarioName,
      description,
      tag
    } = req.body;

    // 1) Get User
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // 2) Get Owner
    const owner = await Owner.findOne({ username });
    if (!owner) {
      return res.json({ success: false, message: "Owner not found" });
    }

    // 3) Get Business Data
    const business = await BusinessData.findOne({ owner: owner._id });
    if (!business) {
      return res.json({
        success: false,
        message: "BusinessData not found for this owner"
      });
    }

    // 4) Create new scenario object
    const newScenario = {
      productName,
      pricePerUnit,
      variableCostPerUnit,
      fixedCost,
      breakEvenUnits,
      breakEvenSales,
      scenarioName: scenarioName || "Unnamed Scenario",
      description: description || "",
      tag: tag || "Break-Even",
      createdAt: new Date()
    };

    // 5) Push to array
    business.scenarios.push(newScenario);

    // 6) Save
    await business.save();

    return res.json({
      success: true,
      message: "Scenario saved successfully",
      scenario: newScenario
    });

  } catch (err) {
    console.error("POST /api/pricing-scenarios/save error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
});

/* ============================================================
   GET ALL BREAK-EVEN SCENARIOS FOR AN OWNER (NEW SYSTEM)
============================================================ */
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // 1) find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
        scenarios: [],
      });
    }

    // 2) owner is user._id
    const owner = await Owner.findOne({ username });
    if (!owner) {
      return res.json({
        success: false,
        message: "Owner not found for this user",
        scenarios: [],
      });
    }

    // 3) get business data
    const business = await BusinessData.findOne({ owner: owner._id });
    if (!business) {
      return res.json({
        success: true,
        message: "No BusinessData found",
        scenarios: [],
      });
    }

    const list = business.scenarios || [];

    // 4) format BEP scenarios for the frontend
    const scenarios = list.map((s) => {
      const price = Number(s.pricePerUnit || 0);
      const variableCost = Number(s.variableCostPerUnit || 0);
      const fixedCost = Number(s.fixedCost || 0);
      const units = Number(s.breakEvenUnits || 0);

      const fixedCostPerUnit = units > 0 ? fixedCost / units : 0;

      const totalRevenue = Number(s.breakEvenSales || price * units || 0);
      const totalVariableCost = variableCost * units;
      const totalFixedCost = fixedCost;
      const totalProfit = totalRevenue - totalVariableCost - totalFixedCost;

      const profitPerUnit = units > 0 ? totalProfit / units : 0;
      const profitMargin =
        totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      return {
        _id: s._id,
        productName: s.productName,
        scenarioName: s.scenarioName,
        description: s.description,
        tag: s.tag || "Break-Even",

        newPrice: price,
        variableCost,
        fixedCostPerUnit,

        totalRevenue,
        totalProfit,
        profitPerUnit,
        profitMargin,

        breakEvenUnits: units,
        breakEvenSales: totalRevenue,

        timestamp: s.createdAt,
      };
    });

    return res.json({
      success: true,
      scenarios,
    });
  } catch (err) {
    console.error("GET /api/pricing-scenarios error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ============================================================
   DELETE A SINGLE BREAK-EVEN SCENARIO
============================================================ */
router.delete("/:username/:scenarioId", async (req, res) => {
  try {
    const { username, scenarioId } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const owner = await Owner.findById(user._id);
    if (!owner) {
      return res.status(404).json({ success: false, msg: "Owner not found" });
    }

    const business = await BusinessData.findOne({ owner: owner._id });
    if (!business) {
      return res.status(404).json({
        success: false,
        msg: "BusinessData not found",
      });
    }

    const before = business.scenarios.length;
    business.scenarios = business.scenarios.filter(
      (s) => s._id.toString() !== scenarioId
    );

    if (business.scenarios.length === before) {
      return res.status(404).json({
        success: false,
        msg: "Scenario not found",
      });
    }

    await business.save();

    return res.json({
      success: true,
      msg: "Scenario deleted successfully",
    });
  } catch (err) {
    console.error("Delete scenario error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;

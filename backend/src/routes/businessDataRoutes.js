// routes/businessDataRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");

const BusinessData = require("../models/BusinessData");
const Owner = require("../models/Owner");

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ===============================================================
   UPLOAD BUSINESS DATA
=============================================================== */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { ownerId, parsedData } = req.body;

    if (!ownerId) {
      return res.status(400).json({ success: false, msg: "ownerId is required" });
    }

    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ success: false, msg: "Owner not found" });
    }

    if (!parsedData) {
      return res.status(400).json({ success: false, msg: "parsedData is required" });
    }

    let data;
    try {
      data = JSON.parse(parsedData);
    } catch (err) {
      return res.status(400).json({
        success: false,
        msg: "parsedData is not valid JSON",
      });
    }

    // ========= map Option B fields =========
    const formatted = {
      owner: ownerId,
      businessName: data.businessName || "My Business",

      products: (data.products || []).map((p) => ({
        name: p.name,
        value: p.value || "",
        pricePerUnit: Number(p.pricePerUnit || 0),
        variableCostPerUnit: Number(p.variableCostPerUnit || 0),
        fixedCosts: Number(p.fixedCosts || 0),
        cm: Number(p.cm || 0),
        breakEvenUnits: Number(p.breakEvenUnits || 0),
        breakEvenSar: Number(p.breakEvenSar || 0),
      })),

      cashFlow: (data.cashFlow || []).map((r) => ({
        date: r.date,
        description: r.description,
        cashIn: Number(r.cashIn || 0),
        cashOut: Number(r.cashOut || 0),
        netCashFlow: Number(r.netCashFlow || 0),
        runningBalance: Number(r.runningBalance || 0),
      })),

      pricingScenarios: (data.pricingScenarios || []).map((s) => ({
        scenario: s.scenario,
        price: Number(s.price || 0),
        unitsSold: Number(s.unitsSold || 0),
        revenue: Number(s.revenue || 0),
        variableCost: Number(s.variableCost || 0),
        cm: Number(s.cm || 0),
        profit: Number(s.profit || 0),
      })),

      fixedCost: Number(data.fixedCost || 0),
    };

    // Upsert by owner
    const updated = await BusinessData.findOneAndUpdate(
      { owner: ownerId },
      formatted,
      { new: true, upsert: true }
    );

    owner.businessData = updated._id;
    await owner.save();

    return res.json({
      success: true,
      msg: "Business data saved successfully",
      data: updated,
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
});

/* ===============================================================
   GET BUSINESS DATA FOR OWNER
=============================================================== */
router.get("/owner/:ownerId", async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    const data = await BusinessData.findOne({ owner: ownerId });

    if (!data) {
      return res.status(404).json({
        success: false,
        msg: "No business data found for owner",
      });
    }

    return res.json({ success: true, data });

  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
});

/* ===============================================================
   SAVE BREAK-EVEN SCENARIO by OWNER ID
=============================================================== */
router.post("/scenario/owner/:ownerId", async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    const business = await BusinessData.findOne({ owner: ownerId });
    if (!business) {
      return res.status(404).json({
        success: false,
        msg: "Business not found for this owner",
      });
    }

    const scenario = req.body;

    if (!business.scenarios) business.scenarios = [];

    business.scenarios.push(scenario);
    await business.save();

    return res.json({
      success: true,
      msg: "Scenario saved successfully",
      scenario,
    });

  } catch (err) {
    console.error("Scenario save error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
});

/* ===============================================================
   GET ALL SCENARIOS FOR OWNER
=============================================================== */
router.get("/scenarios/owner/:ownerId", async (req, res) => {
  try {
    const ownerId = req.params.ownerId;

    const business = await BusinessData.findOne({ owner: ownerId }).lean();

    if (!business) {
      return res.status(404).json({
        success: false,
        msg: "Business not found",
      });
    }

    return res.json({
      success: true,
      scenarios: business.scenarios || [],
    });

  } catch (err) {
    console.error("Scenario fetch error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;

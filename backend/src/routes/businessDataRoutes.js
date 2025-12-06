const express = require("express");
const router = express.Router();
const multer = require("multer");

const BusinessData = require("../models/BusinessData");
const Owner = require("../models/Owner");

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ===============================================================
   UPLOAD + PARSE BUSINESS DATA
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

    const data = JSON.parse(parsedData);

    /* 🔥 map the sheets correctly */
    const formatted = {
      owner: ownerId,
      businessName: data.businessName || "My Business",

      products: (data.products || []).map((p) => ({
        name: p.name,
        price: Number(p.price),
        variableCost: Number(p.variableCost),
        fixedCost: Number(p.fixedCost),
        contributionMargin: Number(p.cm),
        breakEvenUnits: Number(p.breakEvenUnits),
        breakEvenSAR: Number(p.breakEvenSAR)
      })),

      cashFlow: (data.cashFlow || []).map((r) => ({
        date: r.date,
        description: r.description,
        cashIn: Number(r.cashIn),
        cashOut: Number(r.cashOut),
        netCashFlow: Number(r.netCashFlow),
        runningBalance: Number(r.runningBalance)
      })),

      pricingScenarios: (data.pricingScenarios || []).map((s) => ({
        scenario: s.scenario,
        price: Number(s.price),
        unitsSold: Number(s.unitsSold),
        revenue: Number(s.revenue),
        variableCost: Number(s.variableCost),
        cm: Number(s.cm),
        profit: Number(s.profit)
      })),

      fixedCost: Number(data.fixedCost || 0)
    };

    /* 🔥 UPSERT (update or insert) */
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
      data: updated
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ success: false, msg: "Server error", error: err.message });
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
        msg: "No business data found for owner"
      });
    }

    return res.json({ success: true, data });
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

module.exports = router;

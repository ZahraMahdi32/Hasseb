const express = require("express");
const router = express.Router();
const multer = require("multer");

const BusinessData = require("../models/BusinessData");
const Owner = require("../models/Owner");

// multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ===============================================================
   UPLOAD OR UPDATE BUSINESS DATA (UPSERT MODE)
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

    // 🔥 UPDATE IF EXISTS — CREATE IF NOT (THE FIX!)
    const updated = await BusinessData.findOneAndUpdate(
      { owner: ownerId },
      {
        owner: ownerId,
        businessName: data.businessName || "",
        products: data.products || [],
        fixedCost: data.fixedCost || 0,
        cashFlow: data.cashFlow || [],
        pricingScenarios: data.pricingScenarios || []
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    // link inside Owner
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

    res.json({
      success: true,
      data
    });

  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
});

module.exports = router;

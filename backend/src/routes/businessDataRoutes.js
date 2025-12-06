// businessDataRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const BusinessData = require("../models/BusinessData");
const Owner = require("../models/Owner");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 Upload Business Data
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

    // Parse JSON
    const data = JSON.parse(parsedData);

    // Create new BusinessData object
    const newBusinessData = new BusinessData({
      ownerId,
      businessName: data.businessName || "My Business",
      products: data.products || [],
      fixedCost: data.fixedCost || 0,
      pricingScenarios: data.pricingScenarios || [],
      cashFlow: data.cashFlow || [],
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    const saved = await newBusinessData.save();

    // 📌 IMPORTANT: Link BusinessData to Owner
    owner.businessData = saved._id;
    await owner.save();

    return res.json({
      success: true,
      msg: "Business data uploaded & linked successfully",
      data: saved
    });
  } catch (error) {
    console.error("🔥 Upload Error:", error);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
});

// 📌 Get Business Data BY OWNER ID
router.get("/owner/:ownerId", async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.ownerId)
      .populate("businessData");

    if (!owner || !owner.businessData) {
      return res.status(404).json({ msg: "No business data found for owner" });
    }

    return res.json({
      success: true,
      data: owner.businessData
    });
  } catch (err) {
    console.error("BusinessData fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;

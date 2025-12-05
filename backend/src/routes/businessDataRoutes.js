const express = require("express");
const router = express.Router();
const multer = require("multer");
const BusinessData = require("../models/BusinessData");
const User = require("../models/User");
const Owner = require("../models/Owner");

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ==========================================
   UPLOAD BUSINESS DATA (Excel + parsed JSON)
========================================== */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // 1) تأكد فيه ملف
    if (!req.file) {
      return res.status(400).json({
        success: false,
        msg: "No file uploaded"
      });
    }

    const { username, parsedData } = req.body;

    if (!username || !parsedData) {
      return res.status(400).json({
        success: false,
        msg: "username and parsedData are required"
      });
    }

    // 2) parsedData يجي من الفرونت كـ JSON String
    let data;
    try {
      data = JSON.parse(parsedData);
    } catch (e) {
      return res.status(400).json({
        success: false,
        msg: "Invalid parsedData JSON",
        error: e.message
      });
    }

    // 3) نجيب User عن طريق username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found for this username"
      });
    }

    // 4) نجيب Owner عن طريق _id (نفسه في signup)
    const owner = await Owner.findById(user._id);
    if (!owner) {
      return res.status(404).json({
        success: false,
        msg: "Owner record not found for this user"
      });
    }

    // 5) نحضر object مطابق للـ BusinessData schema
    const businessDataPayload = {
      owner: owner._id,
      username,
      businessName: data.businessName || owner.businessName || "My Business",
      products: data.products || [],
      fixedCost: data.fixedCost || 0,
      cashFlow: data.cashFlow || [],
      pricingScenarios: data.pricingScenarios || [],
      fileName: req.file.originalname,
      fileSize: req.file.size
    };

    if (!businessDataPayload.products || businessDataPayload.products.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No products found in the data"
      });
    }

    // 6) نحدّث أو ننشئ BusinessData لهذا الـ owner
    let updatedData = await BusinessData.findOneAndUpdate(
      { owner: owner._id },
      businessDataPayload,
      { new: true, upsert: true }
    );

    // 7) نربط BusinessData بالـ Owner
    owner.businessData = updatedData._id;
    await owner.save();

    return res.status(200).json({
      success: true,
      msg: "Business data uploaded & linked to owner successfully",
      data: updatedData
    });
  } catch (err) {
    console.error("🔥 Upload error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message
    });
  }
});

/* ==========================================
   GET BUSINESS DATA BY OWNER ID
========================================== */
router.get("/by-owner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    const businessData = await BusinessData.findOne({ owner: ownerId });
    if (!businessData) {
      return res.status(404).json({
        success: false,
        msg: "No business data found for this owner"
      });
    }

    return res.status(200).json({
      success: true,
      data: businessData
    });
  } catch (err) {
    console.error("🔥 Fetch by owner error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message
    });
  }
});

/* ==========================================
   GET BUSINESS DATA BY USERNAME (قديم)
========================================== */
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const businessData = await BusinessData.findOne({ username });

    if (!businessData) {
      return res.status(404).json({
        success: false,
        msg: "No business data found for this user"
      });
    }

    return res.status(200).json({
      success: true,
      data: businessData
    });
  } catch (err) {
    console.error("🔥 Fetch error:", err);
    return res.status(500).json({
      success: false,
      msg: "Server error",
      error: err.message
    });
  }
});

module.exports = router;

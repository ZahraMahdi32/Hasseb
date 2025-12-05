const express = require("express");
const router = express.Router();

const Owner = require("../../models/Owner");
const Advisor = require("../../models/advisorModels/advisor");
const Feedback = require("../../models/advisorModels/Feedback");

/* ===========================
   OWNER ↔ ADVISOR LINK
=========================== */
router.post("/link", async (req, res) => {
  try {
    const { ownerId, advisorId } = req.body;

    if (!ownerId || !advisorId) {
      return res.status(400).json({ msg: "ownerId and advisorId are required" });
    }

    // Check advisor exists
    const advisor = await Advisor.findById(advisorId);
    if (!advisor) {
      return res.status(404).json({ msg: "Advisor not found" });
    }

    // Check owner exists
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ msg: "Owner not found" });
    }

    // Link owner → advisor
    owner.advisor = advisorId;
    await owner.save();

    return res.json({
      msg: "Owner linked successfully",
      owner,
      advisor
    });

  } catch (err) {
    return res.status(500).json({
      msg: "Server error",
      error: err.message
    });
  }
});
/* =====================================================
   GET ALL FEEDBACK FOR ONE OWNER
===================================================== */
router.get("/feedback/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({ msg: "ownerId is required" });
    }

    // Get all feedback documents that belong to this owner
    const feedback = await Feedback.find({ ownerId })
      .sort({ createdAt: -1 })
      .populate("advisorId", "fullName email");

    return res.json({
      success: true,
      count: feedback.length,
      feedback,
    });
  } catch (err) {
    console.error("❌ Error fetching owner feedback:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});


module.exports = router;

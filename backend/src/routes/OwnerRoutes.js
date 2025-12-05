const express = require("express");
const router = express.Router();

const Owner = require("../models/Owner");
const Advisor = require("../models/advisorModels/advisor");
const AdvisorNotification = require("../models/advisorModels/Notification");

/* ===========================
   LINK OWNER ↔ ADVISOR
=========================== */
router.post("/link", async (req, res) => {
  try {
    const { ownerId, advisorId } = req.body;

    if (!ownerId || !advisorId) {
      return res.status(400).json({ msg: "ownerId and advisorId required" });
    }

    // Find advisor
    const advisor = await Advisor.findById(advisorId);
    if (!advisor) {
      return res.status(404).json({ msg: "Advisor not found" });
    }

    // Find owner
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ msg: "Owner not found" });
    }

    // Link owner → advisor
    owner.advisor = advisor._id;
    await owner.save();

    // Link advisor → owners list
    if (!advisor.owners.includes(owner._id)) {
      advisor.owners.push(owner._id);
      await advisor.save();
    }

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
const Feedback = require("../models/advisorModels/Feedback");

/* ================================
   GET ALL FEEDBACK FOR ONE OWNER
================================ */
router.get("/feedback/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;

    const feedback = await Feedback.find({ ownerId })
      .sort({ createdAt: -1 })
      .populate("advisorId", "fullName email");

    return res.json({ success: true, feedback });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});
const OwnerNotification = require("../models/OwnerNotification");

// SEND NOTIFICATION TO OWNER
router.post("/notifications", async (req, res) => {
  try {
    const { ownerId, title, message } = req.body;

    if (!ownerId || !title || !message)
      return res.status(400).json({ msg: "Missing fields" });

    const notif = await OwnerNotification.create({
      ownerId,
      title,
      message,
    });

    return res.status(201).json({ success: true, notification: notif });
  } catch (err) {
    console.error("Notif error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// GET OWNER NOTIFICATIONS
router.get("/notifications/:ownerId", async (req, res) => {
  try {
    const list = await OwnerNotification.find({
      ownerId: req.params.ownerId,
    }).sort({ createdAt: -1 });

    return res.json({ success: true, notifications: list });
  } catch (err) {
    console.error("Notif fetch error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// MARK AS READ
router.put("/notifications/read/:id", async (req, res) => {
  try {
    const updated = await OwnerNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    return res.json({ success: true, notification: updated });
  } catch (err) {
    console.error("Notif update error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});
/* ================================
   SHARE OWNER DATA WITH ADVISOR
================================ */
router.post("/share", async (req, res) => {
  try {
    const { ownerId, advisorId } = req.body;

    if (!ownerId || !advisorId) {
      return res.status(400).json({ msg: "ownerId and advisorId required" });
    }

    // Find owner
    const owner = await Owner.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ msg: "Owner not found" });
    }

    // Find advisor
    const advisor = await Advisor.findById(advisorId);
    if (!advisor) {
      return res.status(404).json({ msg: "Advisor not found" });
    }

    // Link owner → advisor
    owner.advisor = advisorId;
    await owner.save();

    // Add owner to advisor list
    if (!advisor.owners.includes(ownerId)) {
      advisor.owners.push(ownerId);
      await advisor.save();
    }

    // Create advisor notification
    await AdvisorNotification.create({
      advisorId,
      title: "New Data Shared",
      message: `${owner.fullName} has shared their business data with you.`,
    });

    return res.json({
      success: true,
      msg: "Data shared successfully with advisor",
      owner
    });

  } catch (err) {
    console.error("Share error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;

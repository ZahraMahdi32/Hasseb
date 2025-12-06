// ======================================================
// IMPORTS
// ======================================================
const express = require("express");
const path = require("path");
const multer = require("multer");

const router = express.Router();

// MODELS
const Advisor = require("../../models/advisorModels/advisor");
const Owner = require("../../models/Owner");
const User = require("../../models/User");
const BusinessData = require("../../models/BusinessData");

const Feedback = require("../../models/advisorModels/Feedback");
const Recommendation = require("../../models/advisorModels/Recommendation");
const Notification = require("../../models/advisorModels/Notification");
const Assignment = require("../../models/Assignment");

// RISK ENGINE
const { evaluateOwnerRisk } = require("../../utils/riskEngine");

// ======================================================
// DEBUG ROUTE
// ======================================================
router.get("/ping", (req, res) => {
  res.json({ ok: true, route: "/api/advisor" });
});

// ======================================================
// DASHBOARD — MERGED VERSION (HEAD + other branch)
// ======================================================
router.get("/dashboard/:advisorId", async (req, res) => {
  try {
    const advisorId = req.params.advisorId;

    const advisor = await Advisor.findById(advisorId);
    if (!advisor) return res.status(404).json({ msg: "Advisor not found" });

    // 1) Owners (from HEAD approach)
    const owners = await Owner.find({ advisor: advisorId })
      .populate("businessData")
      .lean();

    // 2) Their usernames
    const ownerIds = owners.map((o) => o._id);
    const users = await User.find({ _id: { $in: ownerIds } }, { username: 1 }).lean();

    const userById = {};
    users.forEach((u) => (userById[u._id.toString()] = u.username));

    // 3) Attach business data for each owner
    const ownersWithData = await Promise.all(
      owners.map(async (o) => {
        const username = userById[o._id.toString()];
        let businessData = null;
        if (username) {
          businessData = await BusinessData.findOne({ username }).lean();
        }
        return { ...o, username, businessData };
      })
    );

    // 4) GET FEEDBACK
    const feedback = await Feedback.find({ advisorId }).sort({ createdAt: -1 });

    // 5) Run risk engine
    const riskData = ownersWithData.map((o) =>
      evaluateOwnerRisk(o.businessData || {})
    );

    // 6) Auto notifications (keep HEAD version)
    for (const r of riskData) {
      if (r.level === "High") {
        const exists = await Notification.findOne({
          advisorId,
          message: { $regex: r.ownerId?.toString() || "" },
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });

        if (!exists) {
          await Notification.create({
            advisorId,
            title: "High Risk Alert",
            message: `Risk level is HIGH for one of your owners.`,
          });
        }
      }
    }

    return res.json({
      advisor,
      owners: ownersWithData,
      feedback,
      riskData,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// FEEDBACK — ADD
// ======================================================
router.post("/feedback", async (req, res) => {
  try {
    const { advisorId, ownerId, content } = req.body;

    if (!advisorId || !ownerId || !content?.trim()) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const fb = await Feedback.create({ advisorId, ownerId, content });

    return res.json({
      success: true,
      msg: "Feedback added successfully",
      feedback: fb,
    });
  } catch (err) {
    console.error("Feedback error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// FEEDBACK — GET ALL
// ======================================================
router.get("/feedback/all/:advisorId", async (req, res) => {
  try {
    const advisorId = req.params.advisorId;

    const list = await Feedback.find({ advisorId }).sort({ createdAt: -1 });
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// FEEDBACK — DELETE
// ======================================================
router.delete("/feedback/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Feedback not found" });

    return res.json({ msg: "Feedback deleted", deleted });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// FEEDBACK — UPDATE
// ======================================================
router.put("/feedback/:id", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ msg: "Content is required" });
    }

    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Feedback not found" });

    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// SUGGESTIONS — ADD
// ======================================================
router.post("/suggestions", async (req, res) => {
  try {
    const { advisorId, ownerId, suggestion } = req.body;

    if (!advisorId || !ownerId || !suggestion) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const rec = await Recommendation.create({
      advisorId,
      ownerId,
      suggestion,
    });

    return res.status(201).json(rec);
  } catch (err) {
    console.error("Suggestion error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// ======================================================
// SUGGESTIONS — GET FOR OWNER
// ======================================================
router.get("/suggestions/:ownerId", async (req, res) => {
  try {
    const list = await Recommendation.find({
      ownerId: req.params.ownerId,
    }).sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    console.error("Suggestions error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// ======================================================
// NOTIFICATIONS (ADD)
// ======================================================
router.post("/notifications", async (req, res) => {
  try {
    const { advisorId, title, message } = req.body;

    if (!advisorId || !title || !message) {
      return res.status(400).json({ msg: "Missing fields" });
    }

    const notif = await Notification.create({
      advisorId,
      title,
      message,
    });

    return res.status(201).json(notif);
  } catch (err) {
    console.error("Notification create error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// ======================================================
// NOTIFICATIONS — GET
// ======================================================
router.get("/notifications/:advisorId", async (req, res) => {
  try {
    const list = await Notification.find({ advisorId: req.params.advisorId })
      .sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    console.error("GET notifications error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
});

// ======================================================
// OWNERS LINKED TO ADVISOR
// ======================================================
router.get("/owners/:advisorId", async (req, res) => {
  try {
    const owners = await Owner.find({ advisor: req.params.advisorId })
      .select("_id fullName username")
      .lean();

    return res.json({ success: true, owners });
  } catch (err) {
    console.error("GET OWNERS ERROR:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// RECOMMENDATION — ADD
// ======================================================
router.post("/recommendations", async (req, res) => {
  try {
    const { advisorId, ownerId, text } = req.body;

    if (!advisorId || !ownerId || !text?.trim()) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const newRec = await Recommendation.create({
      advisorId,
      ownerId,
      text,
    });

    return res.json({ success: true, recommendation: newRec });
  } catch (err) {
    console.error("Recommendation error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// RECOMMENDATION — GET
// ======================================================
router.get("/recommendations/:advisorId", async (req, res) => {
  try {
    const list = await Recommendation.find({
      advisorId: req.params.advisorId,
    }).sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    console.error("Get recommendations error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// UPLOAD FEEDBACK FILE
// ======================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads", "feedback"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/feedback/file", upload.single("file"), async (req, res) => {
  try {
    const { advisorId, ownerId } = req.body;

    if (!advisorId || !ownerId) {
      return res.status(400).json({ message: "advisorId and ownerId are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/feedback/${req.file.filename}`;

    const fb = await Feedback.create({
      advisorId,
      ownerId,
      fileUrl,
      content: "",
    });

    return res.status(201).json(fb);
  } catch (err) {
    console.error("FILE FEEDBACK ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

// backend/src/routes/advisorRoutes/advisorRoute.js
const express = require("express");
const router = express.Router();

const Advisor = require("../../models/advisorModels/advisor");
const Owner = require("../../models/Owner");
const User = require("../../models/User");
const BusinessData = require("../../models/BusinessData");

const Feedback = require("../../models/advisorModels/Feedback");
const Recommendation = require("../../models/advisorModels/Recommendation");
const Notification = require("../../models/advisorModels/Notification");

const { evaluateOwnerRisk } = require("../../utils/riskEngine");

/* ======================================================
   CLEAN DASHBOARD — ONLY REAL DATA
====================================================== */
router.get("/dashboard/:advisorId", async (req, res) => {
  try {
    const advisorId = req.params.advisorId;

    const advisor = await Advisor.findById(advisorId);
    if (!advisor) return res.status(404).json({ msg: "Advisor not found" });

    /* ---------------------------------------
       1) GET OWNERS LINKED TO THIS ADVISOR
    ----------------------------------------*/
const owners = await Owner.find({ advisor: advisorId })
  .populate("businessData") 
  .lean();

    /* ---------------------------------------
       2) GET THEIR USERNAMES
    ----------------------------------------*/
    const ownerIds = owners.map((o) => o._id);
    const users = await User.find(
      { _id: { $in: ownerIds } },
      { username: 1 }
    ).lean();

    const userById = {};
    users.forEach((u) => (userById[u._id.toString()] = u.username));

    /* ---------------------------------------
       3) ATTACH BUSINESS DATA FOR EACH OWNER
    ----------------------------------------*/
    const ownersWithData = await Promise.all(
      owners.map(async (o) => {
        const username = userById[o._id.toString()];
        let businessData = null;

        if (username) {
          businessData = await BusinessData.findOne({ username }).lean();
        }

        return {
          ...o,
          username,
          businessData: businessData || null,
        };
      })
    );

    /* ---------------------------------------
       4) GET EXTRA ADVISOR DATA 
    ----------------------------------------*/
    const feedback = await Feedback.find({ advisorId }).sort({ createdAt: -1 });

    /* ---------------------------------------
       5) EVALUATE RISK PER OWNER
    ----------------------------------------*/
    const riskData = ownersWithData.map((o) =>
      evaluateOwnerRisk(o.businessData || {})
    );

    /* ---------------------------------------
       6) AUTO-GENERATED NOTIFICATIONS ONLY
    ----------------------------------------*/
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

    /* ---------------------------------------
       7) FINAL CLEAN RESPONSE
    ----------------------------------------*/
    return res.json({
      advisor,
      owners: ownersWithData,
      feedback,
      riskData
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});
/* ======================================================
   ADD GET EDIT DELETE FEEDBACK
====================================================== */
router.post("/feedback", async (req, res) => {
  try {
    const { advisorId, ownerId, content } = req.body;

    if (!advisorId || !ownerId || !content.trim()) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const fb = await Feedback.create({
      advisorId,
      ownerId,
      content
    });

    return res.json({
      success: true,
      msg: "Feedback added successfully",
      feedback: fb
    });
  } catch (err) {
    console.error("Feedback error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});
console.log("FEEDBACK FROM DB:", Feedback);

router.get("/feedback/all/:advisorId", async (req, res) => {
  try {
    const list = await Feedback.find({
      advisorId: req.params.advisorId,
    }).sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});
router.delete("/feedback/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ msg: "Feedback not found" });
    }

    return res.json({ msg: "Feedback deleted", deleted });
  } catch (err) {
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

router.put("/feedback/:id", async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ msg: "Content is required" });
    }

    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      { content },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: "Feedback not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("UPDATE FEEDBACK ERROR:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ======================================================
   ADVISOR — GET ALL TICKETS
====================================================== */
router.get("/tickets/:advisorId", async (req, res) => {
  try {
    const advisorId = req.params.advisorId;

    const tickets = await Assignment.find({ advisorId })
      .sort({ createdAt: -1 });

    return res.json(tickets);
  } catch (err) {
    console.error("GET tickets error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ======================================================
   ADVISOR — GET NOTIFICATIONS
====================================================== */
router.get("/notifications/:advisorId", async (req, res) => {
  try {
    const advisorId = req.params.advisorId;

    const list = await Notification.find({ advisorId })
      .sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    console.error("GET notifications error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ======================================================
   ADVISOR — GET FEEDBACK LIST (short route)
====================================================== */
router.get("/feedback/:advisorId", async (req, res) => {
  try {
    const list = await Feedback.find({ advisorId: req.params.advisorId })
      .sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    console.error("GET feedback error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// ======================================================
// GET OWNERS LINKED TO AN ADVISOR
// ======================================================
router.get("/owners/:advisorId", async (req, res) => {
  try {
    const advisorId = req.params.advisorId;

    const owners = await Owner.find({ advisor: advisorId })
      .select("_id fullName username")   // فقط اللي تحتاجينه
      .lean();

    return res.json({ success: true, owners });
  } catch (err) {
    console.error("GET OWNERS ERROR:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});
/* ======================================================
   ADD RECOMMENDATION
====================================================== */
router.post("/recommendations", async (req, res) => {
  try {
    const { advisorId, ownerId, text } = req.body;

    if (!advisorId || !ownerId || !text?.trim()) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const newRec = await Recommendation.create({
      advisorId,
      ownerId,
      text
    });

    return res.json({ success: true, recommendation: newRec });
  } catch (err) {
    console.error("Recommendation error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/* ======================================================
   GET RECOMMENDATIONS
====================================================== */
router.get("/recommendations/:advisorId", async (req, res) => {
  try {
    const list = await Recommendation.find({
      advisorId: req.params.advisorId,
    }).sort({ createdAt: -1 });

    return res.json(list);
  } catch (err) {
    console.error("Get recommendations error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


module.exports = router;

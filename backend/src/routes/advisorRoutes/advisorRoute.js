// backend/src/routes/advisorRoutes/advisorRoute.js
const express = require("express");
const router = express.Router();

const Advisor = require("../../models/advisorModels/advisor");
const Owner = require("../../models/Owner");
const User = require("../../models/User");
const BusinessData = require("../../models/BusinessData");

const Ticket = require("../../models/advisorModels/Ticket");
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
    const owners = await Owner.find({ advisor: advisorId }).lean();

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
    const tickets = await Ticket.find({ advisorId }).sort({ createdAt: -1 });
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
      tickets,
      feedback,
      riskData
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;

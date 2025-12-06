const express = require("express");
const router = express.Router();
const BusinessData = require("../models/BusinessData");

// GET BUSINESS DATA + SCENARIOS BY OWNER ID
router.get("/owner/:ownerId", async (req, res) => {
    try {
        const { ownerId } = req.params;

        const businessData = await BusinessData.findOne({ owner: ownerId });

        if (!businessData) {
            return res.json({
                success: true,
                business: null,
                scenarios: []
            });
        }

        return res.json({
            success: true,
            business: businessData,
            scenarios: businessData.scenarios || []
        });

    } catch (err) {
        console.error("Error fetching owner business data:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

module.exports = router;

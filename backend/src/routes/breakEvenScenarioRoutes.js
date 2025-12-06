const express = require("express");
const router = express.Router();
const BusinessData = require("../models/BusinessData");

// SAVE BREAK-EVEN SCENARIO (Frontend-friendly version)
router.post("/", async (req, res) => {
    try {
        const {
            username,
            productId,
            productName,
            fixedCost,
            variableCostPerUnit,
            pricePerUnit,
            breakEvenUnits,
            breakEvenSales,
            contributionMargin,
            timestamp
        } = req.body;

        // Find business by username
        const business = await BusinessData.findOne({ username });

        if (!business) {
            return res.status(404).json({
                success: false,
                message: "Business not found for this user"
            });
        }

        const scenario = {
            productId,
            productName,
            fixedCost,
            variableCostPerUnit,
            pricePerUnit,
            breakEvenUnits,
            breakEvenSales,
            contributionMargin,
            timestamp
        };

        business.scenarios.push(scenario);
        await business.save();

        return res.json({
            success: true,
            message: "Scenario saved!",
            scenario
        });

    } catch (err) {
        console.error("🔥 Error saving break-even scenario:", err);
        return res.status(500).json({
            success: false,
            message: "Server error saving scenario"
        });
    }
});

module.exports = router;

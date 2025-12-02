const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const BusinessData = require("../models/BusinessData");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload business data
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                msg: "No file uploaded"
            });
        }

        const { username, parsedData } = req.body;

        if (!username) {
            return res.status(400).json({
                success: false,
                msg: "Username is required"
            });
        }

        // Parse the JSON string back to object
        const data = JSON.parse(parsedData);

        // Create business data object matching your schema
        const businessData = {
            username,
            businessName: data.businessName || "My Business",
            products: data.products || [],
            fixedCost: data.fixedCost || 0,
            cashFlow: data.cashFlow || [],
            pricingScenarios: data.pricingScenarios || [],
            fileName: req.file.originalname,
            fileSize: req.file.size
        };

        // Validation
        if (!businessData.products || businessData.products.length === 0) {
            return res.status(400).json({
                success: false,
                msg: "No products found in the data"
            });
        }

        // Update or create business data
        const updatedData = await BusinessData.findOneAndUpdate(
            { username },
            businessData,
            { new: true, upsert: true }
        );

        return res.status(200).json({
            success: true,
            msg: "Business data uploaded successfully",
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

// Get business data by username
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
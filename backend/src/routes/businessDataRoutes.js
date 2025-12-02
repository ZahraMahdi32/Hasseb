const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const BusinessData = require("../models/BusinessData");

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, "../../uploads");

        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-originalname
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        // Accept only Excel files
        const allowedTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only Excel files (.xlsx, .xls) are allowed"));
        }
    }
});

/* ------------------------------------
   POST: Upload and Parse Excel File
------------------------------------- */
router.post("/upload", upload.single("excelFile"), async (req, res) => {
    try {
        console.log("📥 Received file upload request");

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                msg: "No file uploaded"
            });
        }

        // Get parsed data from request body (sent by frontend)
        const { parsedData, userId } = req.body;

        if (!parsedData) {
            return res.status(400).json({
                success: false,
                msg: "No parsed data provided"
            });
        }

        // Parse the stringified JSON
        const data = JSON.parse(parsedData);

        console.log("✅ File received:", req.file.originalname);
        console.log("📊 Parsed data structure:", {
            products: data.products?.length,
            cashFlow: data.cashFlow?.length,
            pricingScenarios: data.pricingScenarios?.length
        });

        // Validate data structure
        if (!data.fixedCost || !data.products || !data.cashFlow) {
            return res.status(400).json({
                success: false,
                msg: "Invalid data structure. Missing required sheets or data."
            });
        }

        // Check if user already has business data
        let businessData = await BusinessData.findOne({ userId });

        if (businessData) {
            // Update existing data
            businessData.fixedCost = data.fixedCost;
            businessData.products = data.products;
            businessData.cashFlow = data.cashFlow;
            businessData.pricingScenarios = data.pricingScenarios || [];
            businessData.fileName = req.file.originalname;
            businessData.fileSize = req.file.size;
            businessData.filePath = req.file.path;
            businessData.uploadedAt = new Date();

            await businessData.save();

            console.log("✅ Business data updated for user:", userId);
        } else {
            // Create new business data
            businessData = new BusinessData({
                userId,
                fixedCost: data.fixedCost,
                products: data.products,
                cashFlow: data.cashFlow,
                pricingScenarios: data.pricingScenarios || [],
                fileName: req.file.originalname,
                fileSize: req.file.size,
                filePath: req.file.path
            });

            await businessData.save();

            console.log("✅ Business data created for user:", userId);
        }

        return res.status(200).json({
            success: true,
            msg: "File uploaded and data saved successfully",
            data: {
                id: businessData._id,
                fileName: businessData.fileName,
                uploadedAt: businessData.uploadedAt,
                summary: {
                    products: businessData.products.length,
                    cashFlowEntries: businessData.cashFlow.length,
                    pricingScenarios: businessData.pricingScenarios.length
                }
            }
        });

    } catch (err) {
        console.error("🔥 Upload error:", err);

        // Delete uploaded file if error occurs
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            msg: "Server error during file upload",
            error: err.message
        });
    }
});

/* ------------------------------------
   GET: Fetch User's Business Data
------------------------------------- */
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const businessData = await BusinessData.findOne({ userId });

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

/* ------------------------------------
   DELETE: Remove User's Business Data
------------------------------------- */
router.delete("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const businessData = await BusinessData.findOneAndDelete({ userId });

        if (!businessData) {
            return res.status(404).json({
                success: false,
                msg: "No business data found for this user"
            });
        }

        // Delete the uploaded file
        if (businessData.filePath && fs.existsSync(businessData.filePath)) {
            fs.unlinkSync(businessData.filePath);
        }

        return res.status(200).json({
            success: true,
            msg: "Business data deleted successfully"
        });

    } catch (err) {
        console.error("🔥 Delete error:", err);
        return res.status(500).json({
            success: false,
            msg: "Server error",
            error: err.message
        });
    }
});

module.exports = router;
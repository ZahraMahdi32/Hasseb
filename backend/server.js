// ===============================
//  IMPORTS
// ===============================
// Load environment variables from backend/.env
require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

// Debug logs to verify env loaded
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "MISSING");

// Core user routes
const userRoutes = require("./src/routes/userRoutes");

// Business Data (Excel upload + fetch)
const businessDataRoutes = require("./src/routes/businessDataRoutes");

// Advisor system routes
const advisorRoute = require("./src/routes/advisorRoutes/advisorRoute");
const advisorTicketRoutes = require("./src/routes/advisorRoutes/advisorTicketRoutes");
const ownerAdvisorRoutes = require("./src/routes/advisorRoutes/ownerAdvisorRoutes");

// Owner routes
const ownerRoutes = require("./src/routes/OwnerRoutes");

// ===============================
//  CONFIG
// ===============================
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
//  ROOT
// ===============================
app.get("/", (req, res) => {
  res.send("HASEEB BACKEND is running 🚀");
});

// ===============================
//  USER ROUTES
// ===============================
app.use("/api/users", userRoutes);

// ===============================
//  BUSINESS DATA ROUTES
// ===============================
app.use("/api/business-data", businessDataRoutes);

// ===============================
//  ADVISOR ROUTES
// ===============================
app.use("/api/advisor", advisorRoute);
app.use("/api/advisor", advisorTicketRoutes);

// Owner ↔ Advisor linking
app.use("/api/link", ownerAdvisorRoutes);

// ===============================
//  OWNER ROUTES
// ===============================
app.use("/api/owner", ownerRoutes);

// ===============================
//  START SERVER
// ===============================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}/`);
});

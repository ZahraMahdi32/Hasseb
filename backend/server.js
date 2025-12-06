// ===============================
//  IMPORTS
// ===============================
require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

// Core routes
const userRoutes = require("./src/routes/userRoutes");
const businessDataRoutes = require("./src/routes/businessDataRoutes");
const advisorRoute = require("./src/routes/advisorRoutes/advisorRoute");
const ownerAdvisorRoutes = require("./src/routes/advisorRoutes/ownerAdvisorRoutes");
const ownerRoutes = require("./src/routes/OwnerRoutes");
const scenarioRoutes = require("./src/routes/scenarioRoutes");
const assignmentRoutes = require("./src/routes/ManagerRoutes/AssignmentRoutes"); 
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
//  ROUTES
// ===============================
app.use("/api/users", userRoutes);
app.use("/api/business-data", businessDataRoutes);
app.use("/api/advisor", advisorRoute);
app.use("/api/link", ownerAdvisorRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/pricing-scenarios", scenarioRoutes);
app.use("/api/tickets", require("./src/routes/ManagerRoutes/TicketRoutes"));
app.use("/api/assignments", assignmentRoutes); // ⭐ FIXED

// ===============================
//  START SERVER
// ===============================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Visit: http://localhost:${PORT}/`);
});

const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/users  → insert user
router.post("/", async (req, res) => {
  try {
    const { name, email, role, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if email exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      role: role || "member",
      status: status || "active",
    });

    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Server error creating user" });
  }
});

// GET /api/users  → get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

module.exports = router;

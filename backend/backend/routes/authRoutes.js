const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function getEffectiveStudentId(userLike) {
  if (!userLike) return null;
  return userLike.studentId || userLike.username || String(userLike._id || "");
}

function signUser(user) {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      studentId: getEffectiveStudentId(user)
    },
    process.env.JWT_SECRET || "dev-secret",
    { expiresIn: "1d" }
  );
}

router.post("/register", requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Only admin can create users" });
    }

    const { name, username, email, password, role, studentId, specialization } =
      req.body;

    const exists = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      username,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      studentId: role === "student" ? (studentId || username) : (studentId || null),
      specialization: specialization || ""
    });

    res.status(201).json({
      token: signUser(user),
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        studentId: getEffectiveStudentId(user)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      token: signUser(user),
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        studentId: getEffectiveStudentId(user)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to login" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

module.exports = router;

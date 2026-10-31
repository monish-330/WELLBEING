const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Mood = require("../models/Mood");
const Journal = require("../models/Journal");
const Post = require("../models/Post");
const Appointment = require("../models/Appointment");
const EMAQuestion = require("../models/EMAQuestion");
const MotivationQuote = require("../models/MotivationQuote");
const DailyRisk = require("../models/DailyRisk");
const { requireRole } = require("../middleware/auth");
const memoryCache = require("../utils/cache");

const router = express.Router();

function normalizeRiskLevel(value) {
  return String(value || "").trim().toUpperCase();
}

router.get("/summary", requireRole("admin"), async (req, res) => {
  const [students, counselors, admins, moods, journals, posts, appointments, highRisk] =
    await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "counselor" }),
      User.countDocuments({ role: "admin" }),
      Mood.countDocuments(),
      Journal.countDocuments(),
      Post.countDocuments(),
      Appointment.countDocuments(),
      DailyRisk.countDocuments({ finalRiskLevel: "HIGH" })
    ]);

  res.json({
    students,
    counselors,
    admins,
    moods,
    journals,
    posts,
    appointments,
    highRisk
  });
});

router.get("/users", requireRole("admin"), async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
  res.json(users);
});

router.post("/users", requireRole("admin"), async (req, res) => {
  const { name, username, email, password, role, studentId, specialization, department } =
    req.body;
  const effectiveStudentId = role === "student" ? (studentId || username) : null;

  const existingUser = await User.findOne({
    $or: [
      { username },
      { email },
      ...(effectiveStudentId ? [{ studentId: effectiveStudentId }] : [])
    ]
  }).lean();

  if (existingUser) {
    return res.status(400).json({ message: "User, email, or student ID already exists" });
  }

  const user = await User.create({
    name,
    username,
    email,
    password: await bcrypt.hash(password, 10),
    role,
    studentId: effectiveStudentId,
    specialization: specialization || "",
    department: department || ""
  });
  res.status(201).json({ ...user.toObject(), password: undefined });
});

router.delete("/users/:id", requireRole("admin"), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Questions management
router.get("/questions", async (req, res) => {
  const filter = req.query.category ? { category: req.query.category } : {};
  const questions = await EMAQuestion.find(filter).sort({ category: 1, createdAt: -1 }).lean();
  res.json({ questions });
});

router.post("/questions", async (req, res) => {
  const question = await EMAQuestion.create(req.body);
  memoryCache.clearPrefix("questions_");
  res.status(201).json(question);
});

router.put("/questions/:id", async (req, res) => {
  const question = await EMAQuestion.findByIdAndUpdate(req.params.id, req.body, {
    new: true
  });
  memoryCache.clearPrefix("questions_");
  res.json(question);
});

router.delete("/questions/:id", async (req, res) => {
  await EMAQuestion.findByIdAndDelete(req.params.id);
  memoryCache.clearPrefix("questions_");
  res.json({ success: true });
});

// Quotes management
router.get("/quotes", async (req, res) => {
  const filter = req.query.riskLevel
    ? { riskLevel: normalizeRiskLevel(req.query.riskLevel) }
    : {};
  const quotes = await MotivationQuote.find(filter).sort({ riskLevel: 1, createdAt: -1 }).lean();
  res.json({ quotes });
});

router.post("/quotes", async (req, res) => {
  const quote = await MotivationQuote.create({
    ...req.body,
    riskLevel: normalizeRiskLevel(req.body.riskLevel)
  });
  memoryCache.clearPrefix("quote_");
  res.status(201).json(quote);
});

router.delete("/quotes/:id", async (req, res) => {
  await MotivationQuote.findByIdAndDelete(req.params.id);
  memoryCache.clearPrefix("quote_");
  res.json({ success: true });
});

// Dedicated toggle endpoints called by Admin UI components
router.put("/toggle-question/:id", async (req, res) => {
  const question = await EMAQuestion.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  );
  memoryCache.clearPrefix("questions_");
  res.json({ success: true, question });
});

router.put("/toggle-quote/:id", async (req, res) => {
  const quote = await MotivationQuote.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  );
  memoryCache.clearPrefix("quote_");
  res.json({ success: true, quote });
});

// Legacy endpoints used by other components
router.post("/add-question", async (req, res) => {
  const question = await EMAQuestion.create({ ...req.body, options: req.body.options || [0, 1, 2, 3, 4] });
  memoryCache.clearPrefix("questions_");
  res.status(201).json({ success: true, question });
});

router.put("/question/:id", async (req, res) => {
  const question = await EMAQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true });
  memoryCache.clearPrefix("questions_");
  res.json({ success: true, question });
});

router.delete("/question/:id", async (req, res) => {
  await EMAQuestion.findByIdAndDelete(req.params.id);
  memoryCache.clearPrefix("questions_");
  res.json({ success: true });
});

router.post("/add-quote", async (req, res) => {
  const quote = await MotivationQuote.create({
    ...req.body,
    riskLevel: normalizeRiskLevel(req.body.riskLevel)
  });
  memoryCache.clearPrefix("quote_");
  res.status(201).json({ success: true, quote });
});

router.put("/quote/:id", async (req, res) => {
  const quote = await MotivationQuote.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      ...(req.body.riskLevel ? { riskLevel: normalizeRiskLevel(req.body.riskLevel) } : {})
    },
    { new: true }
  );
  memoryCache.clearPrefix("quote_");
  res.json({ success: true, quote });
});

router.delete("/quote/:id", async (req, res) => {
  await MotivationQuote.findByIdAndDelete(req.params.id);
  memoryCache.clearPrefix("quote_");
  res.json({ success: true });
});

module.exports = router;

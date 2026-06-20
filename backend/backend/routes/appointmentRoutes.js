const express = require("express");
const Appointment = require("../models/Appointment");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

function getEffectiveStudentId(userLike) {
  if (!userLike) return null;
  return String(userLike.id || userLike._id || userLike.studentId || userLike.username || "");
}

router.post("/", requireAuth, async (req, res) => {
  const effectiveStudentId =
    req.user?.role === "student" ? getEffectiveStudentId(req.user) : (req.body.studentId || null);

  const appointment = await Appointment.create({
    ...req.body,
    studentId: effectiveStudentId,
    counselorNotified: true
  });
  res.status(201).json(appointment);
});

router.get("/booked-slots", async (req, res) => {
  const confirmed = await Appointment.find({
    counselorId: req.query.counselorId,
    date: req.query.date,
    status: "Confirmed"
  });
  res.json(confirmed.map((appointment) => appointment.slot));
});

router.get("/mine", requireAuth, async (req, res) => {
  const studentId = getEffectiveStudentId(req.user);
  if (req.user?.role !== "student") {
    return res.status(403).json({ message: "Access denied" });
  }

  const appointments = await Appointment.find({ studentId })
    .sort({ createdAt: -1 })
    .populate("counselorId", "name email specialization");

  res.json(appointments);
});

router.get("/counselor/:id", requireRole("counselor", "admin"), async (req, res) => {
  const counselorId = req.user?.role === "counselor" ? req.user.id : req.params.id;
  const appointments = await Appointment.find({ counselorId }).populate(
    "counselorId",
    "name email specialization"
  );
  res.json(appointments);
});

router.get("/:id", requireAuth, async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate(
    "counselorId",
    "name email specialization"
  );
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  if (req.user?.role === "student") {
    const studentId = getEffectiveStudentId(req.user);
    if (String(appointment.studentId) !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }
  }

  if (req.user?.role === "counselor") {
    if (String(appointment.counselorId?._id || appointment.counselorId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }
  }

  res.json(appointment);
});

router.put("/accept/:id", requireRole("counselor", "admin"), async (req, res) => {
  await Appointment.findByIdAndUpdate(req.params.id, { status: "Confirmed" });
  res.json({ success: true });
});

router.put("/reject/:id", requireRole("counselor", "admin"), async (req, res) => {
  await Appointment.findByIdAndUpdate(req.params.id, { status: "Rejected" });
  res.json({ success: true });
});

router.put("/request-reschedule/:id", requireRole("counselor", "admin"), async (req, res) => {
  await Appointment.findByIdAndUpdate(req.params.id, {
    status: "Reschedule Requested"
  });
  res.json({ success: true });
});

router.put("/reschedule/:id", requireAuth, async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  if (req.user?.role === "student") {
    const studentId = getEffectiveStudentId(req.user);
    if (String(appointment.studentId) !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }
  }

  await Appointment.findByIdAndUpdate(req.params.id, {
    date: req.body.date,
    slot: req.body.slot,
    status: "Pending"
  });
  res.json({ success: true });
});

router.put("/complete/:id", requireRole("counselor", "admin"), async (req, res) => {
  await Appointment.findByIdAndUpdate(req.params.id, {
    status: "Completed",
    remarks: req.body.remarks || ""
  });
  res.json({ success: true });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  if (req.user?.role === "student") {
    const studentId = getEffectiveStudentId(req.user);
    if (String(appointment.studentId) !== studentId) {
      return res.status(403).json({ message: "Access denied" });
    }
  }

  if (req.user?.role === "counselor") {
    if (String(appointment.counselorId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }
  }

  await Appointment.findByIdAndUpdate(req.params.id, { status: "Cancelled" });
  res.json({ success: true });
});

// POST - Send message on appointment
router.post("/:id/message", requireAuth, async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  // Verify user has access to this appointment
  const studentId = getEffectiveStudentId(req.user);
  const isStudent = String(appointment.studentId) === studentId && req.user?.role === "student";
  const isCounselor = String(appointment.counselorId) === String(req.user.id) && req.user?.role === "counselor";

  if (!isStudent && !isCounselor) {
    return res.status(403).json({ message: "Access denied" });
  }

  const message = {
    sender: req.user?.role === "student" ? "student" : "counselor",
    senderName: req.body.senderName || req.user?.name || "User",
    text: req.body.text,
    timestamp: new Date()
  };

  appointment.messages.push(message);
  await appointment.save();
  res.status(201).json(appointment);
});

// GET - Retrieve messages for appointment
router.get("/:id/messages", requireAuth, async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  // Verify user has access
  const studentId = getEffectiveStudentId(req.user);
  const isStudent = String(appointment.studentId) === studentId && req.user?.role === "student";
  const isCounselor = String(appointment.counselorId) === String(req.user.id) && req.user?.role === "counselor";

  if (!isStudent && !isCounselor) {
    return res.status(403).json({ message: "Access denied" });
  }

  res.json(appointment.messages || []);
});

// PUT - Counselor accepts the rescheduled appointment
router.put("/accept-reschedule/:id", requireRole("counselor", "admin"), async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  // Update appointment with counselor's suggested date and slot, status to Pending (waiting for student to accept)
  await Appointment.findByIdAndUpdate(req.params.id, {
    counselorSuggestedDate: req.body.date,
    counselorSuggestedSlot: req.body.slot,
    status: "Reschedule Requested"
  });

  res.json({ success: true });
});

module.exports = router;

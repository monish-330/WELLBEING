const express = require("express");
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// Exact required time slots
const VALID_SLOTS = {
  morning: [
    "08:00 AM – 08:50 AM",
    "09:00 AM – 09:50 AM",
    "10:00 AM – 10:50 AM",
    "11:00 AM – 11:50 AM"
  ],
  afternoon: [
    "12:00 PM – 12:50 PM",
    "02:00 PM – 02:50 PM"
  ]
};

// Normalize slot string for reliable comparison across hyphens / dashes
function normalizeSlot(slotStr) {
  if (!slotStr) return "";
  return String(slotStr)
    .replace(/\s*[–—-]\s*/g, " – ")
    .replace(/14:00\s*[–—-]\s*14:50\s*PM/i, "02:00 PM – 02:50 PM")
    .trim();
}

function getStudentLookupKeys(userLike) {
  if (!userLike) return [];
  const keys = [
    userLike.studentId,
    userLike.username,
    userLike.id ? String(userLike.id) : null,
    userLike._id ? String(userLike._id) : null
  ]
    .map((k) => String(k || "").trim())
    .filter(Boolean);
  return [...new Set(keys)];
}

// 1. POST /api/appointments — Book a new appointment
router.post("/", requireAuth, async (req, res) => {
  try {
    const { counselorId, date, slot, session, studentName, email, phone } = req.body;

    if (!counselorId || !date || !slot || !studentName || !email) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    if (!mongoose.Types.ObjectId.isValid(counselorId)) {
      return res.status(400).json({ message: "Invalid counselor ID." });
    }

    // Date validation: cannot book in the past
    const selectedDate = new Date(`${date}T23:59:59`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(selectedDate.getTime()) || selectedDate < today) {
      return res.status(400).json({ message: "Cannot book appointments in the past." });
    }

    const normalizedSlot = normalizeSlot(slot);
    const normalizedSession =
      session === "morning" || session === "Morning Session" || VALID_SLOTS.morning.includes(normalizedSlot)
        ? "Morning Session"
        : "Afternoon Session";

    // Double-booking prevention
    const existingBooking = await Appointment.findOne({
      counselorId: new mongoose.Types.ObjectId(counselorId),
      date,
      slot: { $in: [normalizedSlot, slot] },
      status: { $in: ["Pending", "Confirmed", "Accepted", "Rescheduled"] }
    }).lean();

    if (existingBooking) {
      return res.status(400).json({ message: "This time slot is already booked for this counselor." });
    }

    const studentKeys = getStudentLookupKeys(req.user);
    const effectiveStudentId = req.user?.studentId || req.user?.username || String(req.user?.id || "");
    const effectiveUsername = req.user?.username || "";

    // Lock check: prevent multiple simultaneous active appointments
    const activeAppt = await Appointment.findOne({
      $or: [
        { studentId: { $in: studentKeys } },
        { studentUsername: { $in: studentKeys } },
        { email: req.user?.email || email }
      ],
      status: { $in: ["Pending", "Confirmed", "Accepted", "Rescheduled", "Reschedule Requested"] }
    }).lean();

    if (activeAppt) {
      return res.status(400).json({
        message: "You already have an active appointment booking. You can book a new one once it is completed or cancelled."
      });
    }

    const appointment = await Appointment.create({
      studentName,
      email,
      phone: phone || "",
      counselorId: new mongoose.Types.ObjectId(counselorId),
      studentId: effectiveStudentId,
      studentUsername: effectiveUsername,
      date,
      slot: normalizedSlot,
      session: normalizedSession,
      status: "Pending",
      counselorNotified: true
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: error.message || "Failed to book appointment." });
  }
});

// 2. GET /api/appointments/booked-slots — Get unavailable slots for counselor on date
router.get("/booked-slots", async (req, res) => {
  try {
    const { counselorId, date } = req.query;
    if (!counselorId || !date) {
      return res.json([]);
    }

    if (!mongoose.Types.ObjectId.isValid(counselorId)) {
      return res.json([]);
    }

    const booked = await Appointment.find({
      counselorId: new mongoose.Types.ObjectId(counselorId),
      date,
      status: { $in: ["Pending", "Confirmed", "Accepted", "Rescheduled"] }
    })
      .select("slot")
      .lean();

    const normalizedBookedSlots = booked.map((b) => normalizeSlot(b.slot));
    res.json(normalizedBookedSlots);
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    res.json([]);
  }
});

// 3. GET /api/appointments/mine — Student's appointment history
router.get("/mine", requireAuth, async (req, res) => {
  try {
    if (req.user?.role !== "student") {
      return res.status(403).json({ message: "Access denied." });
    }

    const studentKeys = getStudentLookupKeys(req.user);
    const query = {
      $or: [
        { studentId: { $in: studentKeys } },
        { studentUsername: { $in: studentKeys } },
        ...(req.user.email ? [{ email: req.user.email }] : [])
      ]
    };

    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .populate("counselorId", "name email specialization department")
      .lean();

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching student appointments:", error);
    res.status(500).json({ message: "Failed to fetch appointments." });
  }
});

// 4. GET /api/appointments/counselor/:id — Teacher / Counselor appointment list
router.get("/counselor/:id", requireRole("counselor", "admin"), async (req, res) => {
  try {
    let targetCounselorId = req.user?.role === "counselor" ? req.user.id : req.params.id;

    if (req.user?.role === "admin" && targetCounselorId === "all") {
      const allAppts = await Appointment.find()
        .sort({ createdAt: -1 })
        .populate("counselorId", "name email specialization department")
        .lean();
      return res.json(allAppts);
    }

    if (!mongoose.Types.ObjectId.isValid(targetCounselorId)) {
      // Try resolving by username
      const counselorUser = await User.findOne({
        $or: [{ username: targetCounselorId }, { _id: req.user?.id }]
      }).lean();

      if (counselorUser) {
        targetCounselorId = String(counselorUser._id);
      } else {
        return res.json([]);
      }
    }

    const appointments = await Appointment.find({
      counselorId: new mongoose.Types.ObjectId(targetCounselorId)
    })
      .sort({ createdAt: -1 })
      .populate("counselorId", "name email specialization department")
      .lean();

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching counselor appointments:", error);
    res.status(500).json({ message: "Failed to fetch counselor appointments." });
  }
});

// 5. GET /api/appointments/:id — Single appointment by ID
router.get("/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate("counselorId", "name email specialization department")
      .lean();

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const studentKeys = getStudentLookupKeys(req.user);
    const isOwnerStudent =
      req.user?.role === "student" &&
      (studentKeys.includes(String(appointment.studentId)) ||
        studentKeys.includes(String(appointment.studentUsername)) ||
        appointment.email === req.user.email);

    const isAssignedCounselor =
      req.user?.role === "counselor" &&
      String(appointment.counselorId?._id || appointment.counselorId) === String(req.user.id);

    const isAdmin = req.user?.role === "admin";

    if (!isOwnerStudent && !isAssignedCounselor && !isAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ message: "Failed to fetch appointment details." });
  }
});

// 6. PUT /api/appointments/accept/:id — Teacher accepts appointment
router.put("/accept/:id", requireRole("counselor", "admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "Confirmed" } }, // Confirmed is mapped to Accepted in UI
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.json({ success: true, appointment: updated });
  } catch (error) {
    console.error("Error accepting appointment:", error);
    res.status(500).json({ message: "Failed to accept appointment." });
  }
});

// 7. PUT /api/appointments/reject/:id — Teacher rejects appointment
router.put("/reject/:id", requireRole("counselor", "admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "Rejected" } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.json({ success: true, appointment: updated });
  } catch (error) {
    console.error("Error rejecting appointment:", error);
    res.status(500).json({ message: "Failed to reject appointment." });
  }
});

// 8. PUT /api/appointments/reschedule/:id — Reschedule appointment (Teacher or Student)
router.put("/reschedule/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const studentKeys = getStudentLookupKeys(req.user);
    const isOwnerStudent =
      req.user?.role === "student" &&
      (studentKeys.includes(String(appointment.studentId)) ||
        studentKeys.includes(String(appointment.studentUsername)) ||
        appointment.email === req.user.email);

    const isAssignedCounselor =
      req.user?.role === "counselor" &&
      String(appointment.counselorId) === String(req.user.id);

    const isAdmin = req.user?.role === "admin";

    if (!isOwnerStudent && !isAssignedCounselor && !isAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    const { date, slot, session } = req.body;
    if (!date || !slot) {
      return res.status(400).json({ message: "Date and slot are required." });
    }

    // Past date check
    const selectedDate = new Date(`${date}T23:59:59`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(selectedDate.getTime()) || selectedDate < today) {
      return res.status(400).json({ message: "Cannot reschedule to a past date." });
    }

    const normalizedSlot = normalizeSlot(slot);
    const normalizedSession =
      session ||
      (VALID_SLOTS.morning.includes(normalizedSlot) ? "Morning Session" : "Afternoon Session");

    // Double-booking check
    const conflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      counselorId: appointment.counselorId,
      date,
      slot: { $in: [normalizedSlot, slot] },
      status: { $in: ["Pending", "Confirmed", "Accepted", "Rescheduled"] }
    }).lean();

    if (conflict) {
      return res.status(400).json({ message: "This slot is already booked for this counselor." });
    }

    // If teacher reschedules: status becomes Rescheduled (or Confirmed)
    // If student reschedules: status becomes Pending (waiting for teacher to review)
    const nextStatus = req.user?.role === "counselor" || req.user?.role === "admin"
      ? "Confirmed"
      : "Pending";

    appointment.date = date;
    appointment.slot = normalizedSlot;
    appointment.session = normalizedSession;
    appointment.status = nextStatus;
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    res.status(500).json({ message: error.message || "Failed to reschedule appointment." });
  }
});

// 9. PUT /api/appointments/complete/:id — Teacher marks appointment as Completed
router.put("/complete/:id", requireRole("counselor", "admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const { remarks } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: "Completed",
          remarks: remarks || ""
        }
      },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    res.json({ success: true, appointment: updated });
  } catch (error) {
    console.error("Error completing session:", error);
    res.status(500).json({ message: "Failed to complete appointment." });
  }
});

// 10. DELETE /api/appointments/:id — Cancel appointment (Student or Teacher)
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const studentKeys = getStudentLookupKeys(req.user);
    const isOwnerStudent =
      req.user?.role === "student" &&
      (studentKeys.includes(String(appointment.studentId)) ||
        studentKeys.includes(String(appointment.studentUsername)) ||
        appointment.email === req.user.email);

    const isAssignedCounselor =
      req.user?.role === "counselor" &&
      String(appointment.counselorId) === String(req.user.id);

    const isAdmin = req.user?.role === "admin";

    if (!isOwnerStudent && !isAssignedCounselor && !isAdmin) {
      return res.status(403).json({ message: "Access denied." });
    }

    const cancelledBy = isOwnerStudent ? "student" : "counselor";

    appointment.status = "Cancelled";
    appointment.cancelledBy = cancelledBy;
    await appointment.save();

    res.json({ success: true, message: "Appointment successfully cancelled.", appointment });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ message: "Failed to cancel appointment." });
  }
});

// 11. POST /api/appointments/:id/message — Send chat message
router.post("/:id/message", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const studentKeys = getStudentLookupKeys(req.user);
    const isStudent =
      req.user?.role === "student" &&
      (studentKeys.includes(String(appointment.studentId)) ||
        studentKeys.includes(String(appointment.studentUsername)) ||
        appointment.email === req.user.email);

    const isCounselor =
      req.user?.role === "counselor" &&
      String(appointment.counselorId) === String(req.user.id);

    if (!isStudent && !isCounselor && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied." });
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
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({ message: "Failed to send message." });
  }
});

// 12. GET /api/appointments/:id/messages — Get chat messages
router.get("/:id/messages", requireAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const appointment = await Appointment.findById(req.params.id)
      .select("studentId studentUsername email counselorId messages")
      .lean();

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    const studentKeys = getStudentLookupKeys(req.user);
    const isStudent =
      req.user?.role === "student" &&
      (studentKeys.includes(String(appointment.studentId)) ||
        studentKeys.includes(String(appointment.studentUsername)) ||
        appointment.email === req.user.email);

    const isCounselor =
      req.user?.role === "counselor" &&
      String(appointment.counselorId) === String(req.user.id);

    if (!isStudent && !isCounselor && req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json(appointment.messages || []);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages." });
  }
});

module.exports = router;

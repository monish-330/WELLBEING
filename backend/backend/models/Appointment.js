const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    studentId: { type: String, default: null, index: true },
    date: { type: String, required: true, index: true },
    slot: { type: String, required: true },
    status: { type: String, default: "Pending", index: true },
    counselorNotified: { type: Boolean, default: false },
    remarks: { type: String, default: "" },
    counselorSuggestedDate: { type: String, default: null },
    counselorSuggestedSlot: { type: String, default: null },
    messages: [
      {
        sender: { type: String, enum: ["student", "counselor"], required: true },
        senderName: { type: String, required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

// High-performance compound indexes for slot checking and listing
appointmentSchema.index({ counselorId: 1, date: 1, status: 1 });
appointmentSchema.index({ studentId: 1, createdAt: -1 });
appointmentSchema.index({ counselorId: 1, createdAt: -1 });

module.exports = mongoose.model("Appointment", appointmentSchema);

const mongoose = require("mongoose");

const dailyRiskSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    dayNumber: { type: Number, required: true },
    assessmentDate: { type: String, required: true, index: true },
    ghqScore: { type: Number, default: 0 },
    whoPercentage: { type: Number, default: 0 },
    phqScore: { type: Number, default: 0 },
    gadScore: { type: Number, default: 0 },
    mbiScores: {
      exhaustion: { type: Number, default: 0 },
      cynicism: { type: Number, default: 0 },
      efficacy: { type: Number, default: 0 }
    },
    dailyRiskLevel: { type: String, default: "LOW" },
    finalRiskLevel: { type: String, default: "LOW", index: true },
    assessment1Complete: { type: Boolean, default: false },
    assessment2Complete: { type: Boolean, default: false },
    counselorNotified: { type: Boolean, default: false, index: true },
    hiddenFromCounselor: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

// High-speed compound indexes for 2,000+ student concurrency
dailyRiskSchema.index({ studentId: 1, assessmentDate: 1 });
dailyRiskSchema.index({ studentId: 1, dayNumber: 1, assessmentDate: 1 });
dailyRiskSchema.index({ finalRiskLevel: 1, assessment2Complete: 1, counselorNotified: 1, hiddenFromCounselor: 1 });
dailyRiskSchema.index({ createdAt: -1 });

module.exports = mongoose.model("DailyRisk", dailyRiskSchema);

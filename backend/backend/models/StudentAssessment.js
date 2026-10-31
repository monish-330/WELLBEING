const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: String,
    questionText: String,
    category: String,
    rating: Number
  },
  { _id: false }
);

const studentAssessmentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    dayNumber: { type: Number, required: true },
    assessmentNumber: { type: Number, required: true },
    answers: { type: [answerSchema], default: [] },
    assessmentDate: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

studentAssessmentSchema.index({ studentId: 1, createdAt: -1 });
studentAssessmentSchema.index({ studentId: 1, assessmentDate: 1 });
studentAssessmentSchema.index({ studentId: 1, dayNumber: 1, assessmentDate: 1 });

module.exports = mongoose.model("StudentAssessment", studentAssessmentSchema);

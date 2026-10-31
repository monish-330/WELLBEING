const mongoose = require("mongoose");

const emaQuestionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    category: { type: String, required: true, index: true },
    difficulty: { type: String, default: "basic" },
    options: { type: [Number], default: [0, 1, 2, 3, 4] },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

emaQuestionSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model("EMAQuestion", emaQuestionSchema);

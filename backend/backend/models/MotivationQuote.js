const mongoose = require("mongoose");

const motivationQuoteSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    riskLevel: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH"],
      required: true,
      index: true
    },
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

motivationQuoteSchema.index({ riskLevel: 1, isActive: 1 });

module.exports = mongoose.model("MotivationQuote", motivationQuoteSchema);

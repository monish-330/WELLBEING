const mongoose = require("mongoose");

const selfCareSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true, index: true },
    image: { type: String, default: "" },
    steps: { type: [String], default: [] }
  },
  { timestamps: true }
);

selfCareSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("SelfCare", selfCareSchema);

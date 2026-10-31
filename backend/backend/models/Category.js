const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    image: { type: String, default: "" },
    order: { type: Number, default: 999, index: true }
  },
  { timestamps: true }
);

categorySchema.index({ order: 1, name: 1 });

module.exports = mongoose.model("Category", categorySchema);

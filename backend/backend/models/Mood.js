const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    mood_code: { type: Number, required: true },
    intensity: { type: Number, required: true },
    sticker_code: { type: Number, required: true },
    mood_date: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

moodSchema.index({ userId: 1, mood_date: -1 });

module.exports = mongoose.model("Mood", moodSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "counselor", "admin"],
      required: true,
      index: true
    },

    anonymousName: { type: String, default: null },

    studentId: { type: String, default: null, index: true },
    specialization: { type: String, default: "" },
    department: { type: String, default: "" }
  },
  { timestamps: true }
);

userSchema.index({ role: 1, studentId: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);

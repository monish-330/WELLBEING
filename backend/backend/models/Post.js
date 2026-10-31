const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    anonymousId: String,
    realUserName: String,
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    anonymousId: String,
    realUserName: String,
    likes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] }
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
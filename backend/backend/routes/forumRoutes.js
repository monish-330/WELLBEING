const express = require("express");
const Post = require("../models/Post");
const { requireRole } = require("../middleware/auth");

const router = express.Router();

const bannedWords = [
  "badword1",
  "badword2",
  "idiot",
  "stupid",
  "hate",
  "sex",
  "nude",
  "abuse",
  "kill",
  "dumb",
  "racist",
  "toxic"
];

function containsBadWord(text) {
  const lowerText = String(text || "").toLowerCase();
  return bannedWords.some((word) => lowerText.includes(word));
}

router.get("/", async (_req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).lean();
  res.json(posts);
});

router.post("/", async (req, res) => {
  if (containsBadWord(req.body.title)) {
    return res.status(400).json({ message: "Inappropriate language is not allowed." });
  }

  const post = await Post.create({
    title: req.body.title,
    anonymousId: req.body.anonymousId,
    realUserName: req.body.realUserName || req.body.anonymousId || "Anonymous"
  });
  res.status(201).json(post);
});

// Atomic concurrency-safe like
router.put("/like/:id", async (req, res) => {
  const profileId = req.body.profileId;
  if (!profileId) {
    return res.status(400).json({ message: "profileId is required" });
  }

  const updatedPost = await Post.findOneAndUpdate(
    { _id: req.params.id, likedBy: { $ne: profileId } },
    { $inc: { likes: 1 }, $push: { likedBy: profileId } },
    { new: true }
  );

  if (!updatedPost) {
    const post = await Post.findById(req.params.id).select("likedBy").lean();
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(400).json({ message: "Already liked" });
  }

  res.json(updatedPost);
});

// Atomic concurrency-safe comment
router.post("/comment/:id", async (req, res) => {
  if (containsBadWord(req.body.text)) {
    return res.status(400).json({ message: "Inappropriate language is not allowed." });
  }

  const newComment = {
    text: req.body.text,
    anonymousId: req.body.anonymousId,
    realUserName: req.body.realUserName || req.body.anonymousId || "Anonymous",
    createdAt: new Date()
  };

  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: newComment } },
    { new: true }
  );

  if (!updatedPost) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.json(updatedPost);
});

router.delete("/comment/:postId/:index", requireRole("admin"), async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const index = Number(req.params.index);
  if (Number.isNaN(index) || index < 0 || index >= post.comments.length) {
    return res.status(400).json({ message: "Invalid comment index" });
  }

  post.comments.splice(index, 1);
  await post.save();
  res.json({ success: true, post });
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;

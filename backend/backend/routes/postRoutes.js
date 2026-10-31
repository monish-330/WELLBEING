const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const generateAnonymousName = require("../utils/anonymousName.js");

const leoProfanity = require("leo-profanity");
leoProfanity.loadDictionary();

// =======================
// ✅ CREATE POST
// =======================
router.post("/", async (req, res) => {
  try {
    const { title, userId } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ message: "Title and userId required" });
    }

    if (leoProfanity.check(title)) {
      return res.status(400).json({
        message: "⚠️ Inappropriate language is not allowed"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate anonymous name only once per user
    if (!user.anonymousName) {
      user.anonymousName = generateAnonymousName();
      await user.save();
    }

    const newPost = await Post.create({
      title,
      userId: user._id,
      anonymousId: user.anonymousName,
      realUserName: user.name
    });

    res.json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ✅ GET ALL POSTS (USER)
// =======================
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ✅ LIKE POST (Atomic concurrency-safe update)
// =======================
router.put("/like/:id", async (req, res) => {
  try {
    const { profileId } = req.body;
    if (!profileId) {
      return res.status(400).json({ message: "profileId is required" });
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id, likedBy: { $ne: profileId } },
      { $inc: { likes: 1 }, $push: { likedBy: profileId } },
      { new: true }
    );

    if (!updatedPost) {
      const exists = await Post.findById(req.params.id).select("likedBy").lean();
      if (!exists) {
        return res.status(404).json({ message: "Post not found" });
      }
      return res.status(400).json({ message: "Already liked" });
    }

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ✅ ADD COMMENT (Atomic concurrency-safe update)
// =======================
router.post("/comment/:id", async (req, res) => {
  try {
    const { text, userId } = req.body;

    if (!text || !userId) {
      return res.status(400).json({ message: "Text and userId required" });
    }

    if (leoProfanity.check(text)) {
      return res.status(400).json({
        message: "⚠️ Inappropriate language in comment"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.anonymousName) {
      user.anonymousName = generateAnonymousName();
      await user.save();
    }

    const newComment = {
      text,
      userId: user._id,
      anonymousId: user.anonymousName,
      realUserName: user.name,
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 👩‍💼 ADMIN: GET POSTS
// =======================
router.get("/admin/posts", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name username email")
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ❌ ADMIN: DELETE POST
// =======================
router.delete("/admin/delete/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ❌ DELETE COMMENT
// =======================
router.delete("/admin/delete-comment/:postId/:commentIndex", async (req, res) => {
  try {
    const { postId, commentIndex } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.splice(Number(commentIndex), 1);
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
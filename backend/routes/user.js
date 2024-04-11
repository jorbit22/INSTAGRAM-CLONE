const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const { Types } = require("mongoose"); // Import Types from mongoose

const Post = mongoose.model("Post");
const User = mongoose.model("User");

router.get("/user/:id", requireLogin, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const posts = await Post.find({ postedBy: req.params.id }).populate(
      "postedBy",
      "_id name"
    );
    res.json({ user, posts });
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
});

router.put("/follow", requireLogin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.body.followId,
      {
        $push: { followers: req.user._id },
      },
      { new: true }
    );
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { following: req.body.followId },
      },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

router.put("/unfollow", requireLogin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.body.unfollowId,
      {
        $pull: { followers: req.user._id },
      },
      { new: true }
    );
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { following: req.body.unfollowId },
      },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

router.put("/updatepic", requireLogin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { pic: req.body.pic } },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(422).json({ error: "Failed to update profile picture" });
  }
});

router.post("/search-users", async (req, res) => {
  try {
    const { query } = req.body;
    // Use a regular expression to perform a case-insensitive search based on the email field
    const userPattern = new RegExp(query, "i");
    // Perform the search query on the User model
    const users = await User.find({ email: { $regex: userPattern } }).select(
      "_id email"
    );
    res.json({ users });
  } catch (err) {
    console.error("Error searching users:", err);
    res
      .status(500)
      .json({ error: "An error occurred while searching for users" });
  }
});

module.exports = router;

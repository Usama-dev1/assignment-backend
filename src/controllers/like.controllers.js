import mongoose from "mongoose";
import Like from "../models/like.model.js";
import Post from "../models/post.model.js";

export const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    const post = await Post.findOne({
      _id: postId,
      isDeleted: false,
      draft: false,
    });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const likes = await Like.find({ postId });
    return res.status(200).json({
      success: true,
      data: likes,
      likeCount: likes.length,
    });
  } catch (error) {
    console.error("[getPostLikes] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch likes",
    });
  }
};

export const createLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!postId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Post ID and User ID are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const post = await Post.findOne({
      _id: postId,
      isDeleted: false,
      draft: false,
    });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const like = new Like({ postId, userId });
    await like.save();
    const likeCount = await Like.countDocuments({ postId });
    return res.status(201).json({
      success: true,
      data: like,
      likeCount,
      message: "Like added successfully",
    });
  } catch (error) {
    console.error("[createLike] Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already liked this post",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to add like",
    });
  }
};

export const removeLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!postId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Post ID and User ID are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const post = await Post.findOne({
      _id: postId,
      isDeleted: false,
      draft: false,
    });
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const deletedLike = await Like.findOneAndDelete({ postId, userId });
    if (!deletedLike) {
      return res.status(404).json({
        success: false,
        message: "Like not found",
      });
    }
    const likeCount = await Like.countDocuments({ postId });

    return res.status(200).json({
      likeCount,
      success: true,
      data: deletedLike,
      message: "Like removed successfully",
    });
  } catch (error) {
    console.error("[removeLike] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove like",
    });
  }
};

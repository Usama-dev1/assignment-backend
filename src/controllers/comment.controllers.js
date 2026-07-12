import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";

export const getAllComments = async (req, res) => {
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

    let page = parseInt(req.query.page);
    if (!page || page < 1) page = 1;

    let limit = parseInt(req.query.limit);
    if (!limit || limit < 1) limit = 10;
    limit = Math.min(limit, 50);
    const skip = (page - 1) * limit;

    const [comments, totalCount] = await Promise.all([
      Comment.find({ postId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username email"),
      Comment.countDocuments({ postId }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    return res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: page,
          totalPages,
          totalComments: totalCount,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("[getAllComments] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
};

export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

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

    const contentValue = String(content || "").trim();
    if (!contentValue) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const comment = new Comment({
      postId,
      userId,
      content: contentValue,
    });

    await comment.save();
    await comment.populate("userId", "username email");

    return res.status(201).json({
      success: true,
      data: comment,
      message: "Comment created successfully",
    });
  } catch (error) {
    console.error("[createComment] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create comment",
    });
  }
};

export const getCommentById = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    if (
      !mongoose.Types.ObjectId.isValid(postId) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
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

    const comment = await Comment.findOne({ _id: commentId, postId }).populate(
      "userId",
      "username email",
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("[getCommentById] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch comment",
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(postId) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    if (content === undefined || !String(content).trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
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

    const comment = await Comment.findOne({ _id: commentId, postId }).populate(
      "userId",
      "username email",
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const isOwner = comment.userId._id.toString() === userId;
    const canManageComment =
      req.user.role === "admin" || req.user.role === "super_admin";
    if (!isOwner && !canManageComment) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own comment",
      });
    }

    comment.content = String(content).trim();
    await comment.save();

    return res.status(200).json({
      success: true,
      data: comment,
      message: "Comment updated successfully",
    });
  } catch (error) {
    console.error("[updateComment] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update comment",
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    if (
      !mongoose.Types.ObjectId.isValid(postId) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
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

    const comment = await Comment.findOne({ _id: commentId, postId }).populate(
      "userId",
      "username email",
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const isOwner = comment.userId._id.toString() === userId;
    const canManageComment =
      req.user.role === "admin" || req.user.role === "super_admin";
    if (!isOwner && !canManageComment) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own comment",
      });
    }

    await Comment.deleteOne({ _id: commentId, postId });
    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("[deleteComment] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};

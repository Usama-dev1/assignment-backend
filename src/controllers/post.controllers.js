import mongoose from "mongoose";
import Post from "../models/post.model.js";

//create post controller
export const createPost = async (req, res) => {
  try {
    const { title, content, categoryId, draft } = req.body;
    const userId = req.user.id;
    if (!title || !content || !categoryId || !userId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const isDraft = draft ?? false;
    const newPost = new Post({
      title,
      content,
      categoryId,
      userId,
      draft: isDraft,
    });
    await newPost.save();
    await newPost.populate("categoryId", "title");

    return res.status(201).json({
      success: true,
      data: newPost,
      message: "Post created successfully",
    });
  } catch (error) {
    console.error("[createPost] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create post",
    });
  }
};

// get all posts requires pagination params in query string like ?page=1&limit=10
export const getPosts = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [allPosts, totalCount] = await Promise.all([
      Post.find({ isDeleted: false, draft: false })
        .populate("categoryId", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments({ isDeleted: false, draft: false }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: {
        posts: allPosts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts: totalCount,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("[getPosts] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
    });
  }
};

//requires post id in params to fetch post
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    const post = await Post.findOne({
      _id: id,
      isDeleted: false,
      draft: false,
    }).populate("categoryId", "title");
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("[getPostById] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch post",
    });
  }
};

// get unpublished draft posts requires pagination params in query string like ?page=1&limit=10
export const getDraftPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    let page = parseInt(req.query.page);
    if (!page || page < 1) page = 1;

    let limit = parseInt(req.query.limit);
    if (!limit || limit < 1) limit = 10;
    limit = Math.min(limit, 50);
    const skip = (page - 1) * limit;
    let drafts;
    let totalCount;
    const canSeeAllDraft =
      req.user.role === "admin" || req.user.role === "super_admin";
    if (canSeeAllDraft) {
      [drafts, totalCount] = await Promise.all([
        Post.find({ isDeleted: false, draft: true })
          .populate("categoryId", "title")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Post.countDocuments({ isDeleted: false, draft: true }),
      ]);
    } else {
      [drafts, totalCount] = await Promise.all([
        Post.find({ userId, isDeleted: false, draft: true })
          .populate("categoryId", "title")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Post.countDocuments({ userId, isDeleted: false, draft: true }),
      ]);
    }

    const totalPages = Math.ceil(totalCount / limit);
    return res.status(200).json({
      success: true,
      data: {
        posts: drafts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts: totalCount,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("[getDraftPosts] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch draft posts",
    });
  }
};

export const getDraftPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    const post = await Post.findOne({
      _id: id,
      isDeleted: false,
      draft: true,
    }).populate("categoryId", "title");
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Draft post not found",
      });
    }

    const canSeeAllDraft =
      req.user.role === "admin" || req.user.role === "super_admin";
    const isOwner = post.userId.toString() === req.user.id;

    if (!isOwner && !canSeeAllDraft) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this draft post",
      });
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("[getDraftPostById] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch draft post",
    });
  }
};

//update post requires post id in params and updated data in body
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    let updates = {};

    if (req.body.title !== undefined) {
      updates.title = req.body.title.trim();
    }
    if (req.body.content !== undefined) {
      updates.content = req.body.content.trim();
    }
    if (req.body.categoryId !== undefined) {
      updates.categoryId = req.body.categoryId.trim();
    }
    if (req.body.draft !== undefined) {
      updates.draft = req.body.draft;
    }

    const post = await Post.findById(id).populate("categoryId", "title");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const isOwner = post.userId.toString() === userId;
    const canUpdateThisPost =
      req.user.role === "admin" || req.user.role === "super_admin";

    if (!isOwner && !canUpdateThisPost) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own post",
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    ).populate("categoryId", "title");

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedPost,
      message: "Post updated successfully",
    });
  } catch (error) {
    console.error("[updatePost] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update post",
    });
  }
};

//soft delete post requires post id in params
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    const post = await Post.findById(id).populate("categoryId", "title");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    //only post owner and admin/super admin can soft delete
    const isOwner = post.userId.toString() === userId;
    const canDeleteThisPost = req.user.role === "super_admin";
    if (!isOwner && !canDeleteThisPost) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own post",
      });
    }

    const softDeletedPost = await Post.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true } },
      { new: true, runValidators: true },
    ).populate("categoryId", "title");

    if (!softDeletedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("[deletePost] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete post",
    });
  }
};

//hard delete post requires post id in params only admin and super admin
export const hardDeletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    //only admin/super admin can hard delete
    const canDeleteThisPost = req.user.role === "super_admin";
    if (!canDeleteThisPost) {
      return res.status(403).json({
        success: false,
        message: "You can't delete this post",
      });
    }

    const hardDeletedPost = await Post.findByIdAndDelete(id);

    if (!hardDeletedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("[hardDeletePost] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete post",
    });
  }
};

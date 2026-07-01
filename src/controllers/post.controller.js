import mongoose from "mongoose";
import Post from "../models/post.model.js";

// ===== CREATE POST =====
export const createPost = async (req, res) => {
  try {
    const { title, content, categoryId, userId } = req.body;

    // Validate required fields (just in case)
    if (!title || !content || !categoryId || !userId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newPost = new Post({ title, content, categoryId, userId });
    await newPost.save();

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

// ===== GET ALL POSTS (with pagination) =====
export const getPosts = async (req, res) => {
  try {
    // If using middleware, use req.validated.query, otherwise fallback to manual parse
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [allPosts, totalCount] = await Promise.all([
      Post.find({}).skip(skip).limit(limit),
      Post.countDocuments({}),
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

// ===== GET POST BY ID =====
export const getPostById = async (req, res) => {
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

// ===== GET DRAFT POSTS =====
export const getDraftPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [drafts, totalCount] = await Promise.all([
      Post.find({ draft: true }).skip(skip).limit(limit),
      Post.countDocuments({ draft: true }),
    ]);

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

// ===== UPDATE POST =====
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    const updates = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    );

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

// ===== DELETE POST =====
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
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

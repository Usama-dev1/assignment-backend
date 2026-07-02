import mongoose from "mongoose";
import Category from "../models/category.model.js";
import Post from "../models/post.model.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ title: 1 });
    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("[getAllCategories] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("[getCategoryById] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch category",
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description || !title.trim() || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const category = new Category({ title, description });
    await category.save();

    return res.status(201).json({
      success: true,
      data: category,
      message: "Category created successfully",
    });
  } catch (error) {
    console.error("[createCategory] Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category title already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    const updates = {};
    if (req.body.title !== undefined) {
      const title = String(req.body.title).trim();
      if (!title) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty",
        });
      }
      updates.title = title;
    }
    if (req.body.description !== undefined) {
      const description = String(req.body.description).trim();
      if (!description) {
        return res.status(400).json({
          success: false,
          message: "Description cannot be empty",
        });
      }
      updates.description = description;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Category update requires title or description",
      });
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedCategory,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("[updateCategory] Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category title already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    const postCount = await Post.countDocuments({
      categoryId: id,
      isDeleted: false,
    });
    if (postCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category while posts still reference it",
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("[deleteCategory] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};

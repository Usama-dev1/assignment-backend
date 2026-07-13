import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";
export const getUsers = async (req, res) => {
  try {
    let page = parseInt(req.query.page);
    if (!page || page < 1) page = 1;

    let limit = parseInt(req.query.limit);
    if (!limit || limit < 1) limit = 10;
    limit = Math.min(limit, 50);

    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      User.find()
        .select("_id username email role isDeleted createdAt updatedAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    const sendUsers = users.map((user) => sanitizeUser(user));
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      success: true,
      data: sendUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error("[getUsers] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await User.findById(id).select(
      "_id username email role isDeleted createdAt updatedAt",
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (error) {
    console.error("[getUserById] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, email, password, role = "user" } = req.body;
    if (role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot create a super admin user",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username or email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
    });
    await user.save();

    return res.status(201).json({
      success: true,
      data: sanitizeUser(user),
      message: "User created successfully",
    });
  } catch (error) {
    console.error("[createUser] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Super admin users cannot be updated",
      });
    }

    if (role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot assign super admin role",
      });
    }

    const conflictUser = await User.findOne({
      $or: [{ email: email?.toLowerCase() }, { username }],
      _id: { $ne: user._id },
    });
    if (conflictUser) {
      return res.status(409).json({
        success: false,
        message: "Username or email already in use",
      });
    }

    if (username) {
      user.username = username.trim();
    }
    if (email) {
      user.email = email.toLowerCase().trim();
    }
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }
    if (role) {
      user.role = role;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      data: sanitizeUser(user),
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("[updateUser] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    if (role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot assign super admin role",
      });
    }

    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Super admin users cannot have their role changed",
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      data: sanitizeUser(user),
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("[updateUserRole] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or already deleted",
      });
    }

    if (user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Super admin users cannot be deleted",
      });
    }

    user.isDeleted = true;
    user.refreshTokenHash = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User soft deleted successfully",
    });
  } catch (error) {
    console.error("[deleteUser] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

export const hardDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Super admin users cannot be deleted",
      });
    }

    await User.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "User hard deleted successfully",
    });
  } catch (error) {
    console.error("[hardDeleteUser] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to hard delete user",
    });
  }
};

export const restoreUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    const user = await User.findOne({ _id: id, isDeleted: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or not deleted",
      });
    }

    user.isDeleted = false;
    user.refreshTokenHash = null;
    await user.save();

    return res.status(200).json({
      success: true,
      data: sanitizeUser(user),
      message: "User restored successfully",
    });
  } catch (error) {
    console.error("[restoreUser] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to restore user",
    });
  }
};

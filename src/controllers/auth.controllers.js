import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import config from "../config/config.js";
import {
  createAccessToken,
  createRefreshToken,
  hashTokenId,
} from "../utils/generateTokenHash.js";

// Public authentication routes available to all users.
// register: create a new account
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "username, email, and password are required",
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

    const refreshTokenId = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });
    const payload = {
      id: user._id,
      role: user.role,
    };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken({
      id: user._id,
      tokenId: refreshTokenId,
    });
    user.refreshTokenHash = hashTokenId(refreshTokenId);
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.set("Cache-Control", "no-store");

    return res.status(201).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      message: "User Registered Successfully",
    });
  } catch (error) {
    console.error("[register] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to register user",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.isDeleted) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const refreshTokenId = crypto.randomBytes(32).toString("hex");
    const payload = {
      id: user._id,
      role: user.role,
    };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken({
      id: user._id,
      tokenId: refreshTokenId,
    });

    user.refreshTokenHash = hashTokenId(refreshTokenId);
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      message: "User Logged In successfully",
    });
  } catch (error) {
    console.error("[login] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to log in",
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
        await User.findByIdAndUpdate(payload.id, {
          refreshTokenHash: null,
        });
      } catch (error) {
        if (
          error.name !== "TokenExpiredError" &&
          error.name !== "JsonWebTokenError"
        ) {
          console.error("[logout] refresh token verify error:", error);
        }
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("[logout] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to log out",
    });
  }
};

export const refreshToken = async (req, res) => {
  //clear dead refresh token cookie
  const clearRefreshCookie = () => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });
  };

  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }
    const payload = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.id).select(
      "role isDeleted refreshTokenHash",
    );
    if (!user || user.isDeleted || !payload.tokenId) {
      clearRefreshCookie();
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    const tokenHash = hashTokenId(payload.tokenId);
    if (!user.refreshTokenHash || user.refreshTokenHash !== tokenHash) {
      clearRefreshCookie();
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    const newRefreshTokenId = crypto.randomBytes(32).toString("hex");
    const accessToken = createAccessToken({ id: payload.id, role: user.role });
    const newRefreshToken = createRefreshToken({
      id: payload.id,
      tokenId: newRefreshTokenId,
    });
    user.refreshTokenHash = hashTokenId(newRefreshTokenId);
    await user.save();
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    console.error("[refreshToken] Error:", error);
    clearRefreshCookie();
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const checkUser = req.user;
    if (!checkUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const user = await User.findOne({
      _id: checkUser.id,
      isDeleted: false,
    }).select("_id username email role");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }
    res.set("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      message: "Profile Found",
    });
  } catch (error) {
    console.error("[getProfile] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization header missing or invalid",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
    req.user = {
      id: payload.id,
      role: payload.role,
    };
    next();
  } catch (error) {
    console.error("[authenticate] Error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};

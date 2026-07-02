import { Router } from "express";
import * as authController from "../controllers/auth.controllers.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validator.js";
import { loginSchema, registerSchema } from "../validators/authSchemas.js";

const authRouter = Router();

// Public auth routes
authRouter.post(
  "/register",
  validate(registerSchema, "body"),
  authController.register,
);
authRouter.post("/login", validate(loginSchema, "body"), authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/refresh-token", authController.refreshToken);
authRouter.get("/get-me", authenticate, authController.getProfile);

export default authRouter;

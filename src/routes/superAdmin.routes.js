import { Router } from "express";
import * as superAdminController from "../controllers/superAdmin.controllers.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validator.js";
import {
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
} from "../validators/userSchemas.js";

const superAdminRouter = Router();

superAdminRouter.get(
  "/users",
  authenticate,
  authorize("super_admin"),
  superAdminController.getUsers,
);
superAdminRouter.get(
  "/users/:id",
  authenticate,
  authorize("super_admin"),
  superAdminController.getUserById,
);
superAdminRouter.post(
  "/users",
  authenticate,
  authorize("super_admin"),
  validate(createUserSchema, "body"),
  superAdminController.createUser,
);
superAdminRouter.patch(
  "/users/:id",
  authenticate,
  authorize("super_admin"),
  validate(updateUserSchema, "body"),
  superAdminController.updateUser,
);
superAdminRouter.patch(
  "/users/:id/role",
  authenticate,
  authorize("super_admin"),
  validate(updateUserRoleSchema, "body"),
  superAdminController.updateUserRole,
);
superAdminRouter.delete(
  "/users/:id",
  authenticate,
  authorize("super_admin"),
  superAdminController.deleteUser,
);
superAdminRouter.delete(
  "/users/:id/hard",
  authenticate,
  authorize("super_admin"),
  superAdminController.hardDeleteUser,
);
superAdminRouter.patch(
  "/users/:id/restore",
  authenticate,
  authorize("super_admin"),
  superAdminController.restoreUser,
);

export default superAdminRouter;

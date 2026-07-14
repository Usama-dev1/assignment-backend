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
//route to fetch all comments
superAdminRouter.get(
  "/users/comments",
  authenticate,
  authorize("admin", "super_admin"),
  superAdminController.getAllComments,
);
//route to fetch all users
superAdminRouter.get(
  "/users",
  authenticate,
  authorize("super_admin"),
  superAdminController.getUsers,
);
//route to get single user
superAdminRouter.get(
  "/users/:id",
  authenticate,
  authorize("super_admin"),
  superAdminController.getUserById,
);

//route to create new user
superAdminRouter.post(
  "/users",
  authenticate,
  authorize("super_admin"),
  validate(createUserSchema, "body"),
  superAdminController.createUser,
);
//route to update a user
superAdminRouter.patch(
  "/users/:id",
  authenticate,
  authorize("super_admin"),
  validate(updateUserSchema, "body"),
  superAdminController.updateUser,
);
//route to update user role
superAdminRouter.patch(
  "/users/:id/role",
  authenticate,
  authorize("super_admin"),
  validate(updateUserRoleSchema, "body"),
  superAdminController.updateUserRole,
);
//route to soft delete a user
superAdminRouter.delete(
  "/users/:id",
  authenticate,
  authorize("super_admin"),
  superAdminController.deleteUser,
);

//route to hard delete a user
superAdminRouter.delete(
  "/users/:id/hard",
  authenticate,
  authorize("super_admin"),
  superAdminController.hardDeleteUser,
);

//route to restore the soft deleted user
superAdminRouter.patch(
  "/users/:id/restore",
  authenticate,
  authorize("super_admin"),
  superAdminController.restoreUser,
);

export default superAdminRouter;

import express from "express";
import * as categoryController from "../controllers/category.controllers.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validator.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validators/categorySchemas.js";

const categoryRouter = express.Router();
categoryRouter.get("/", categoryController.getAllCategories);
categoryRouter.post(
  "/",
  authenticate,
  authorize("admin", "super_admin"),
  validate(createCategorySchema, "body"),
  categoryController.createCategory,
);
categoryRouter.get("/:id", categoryController.getCategoryById);
categoryRouter.put(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  validate(updateCategorySchema, "body"),
  categoryController.updateCategory,
);
categoryRouter.delete(
  "/:id",
  authenticate,
  authorize("admin", "super_admin"),
  categoryController.deleteCategory,
);

export default categoryRouter;

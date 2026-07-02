import express from "express";
import * as commentController from "../controllers/comment.controllers.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validator.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validators/commentSchemas.js";
//create merge router instance

const commentRouter = express.Router({ mergeParams: true });
commentRouter.get("/", commentController.getAllComments);
commentRouter.post(
  "/",
  authenticate,
  validate(createCommentSchema, "body"),
  commentController.createComment,
);
commentRouter.get("/:commentId", commentController.getCommentById);
commentRouter.put(
  "/:commentId",
  authenticate,
  validate(updateCommentSchema, "body"),
  commentController.updateComment,
);
commentRouter.delete(
  "/:commentId",
  authenticate,
  commentController.deleteComment,
);

export default commentRouter;

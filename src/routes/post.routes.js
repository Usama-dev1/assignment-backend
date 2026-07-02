import { Router } from "express";
import * as postController from "../controllers/post.controllers.js";
import { validate } from "../middleware/validator.js";
import {
  createPostSchema,
  updatePostSchema,
} from "../validators/postSchemas.js";
import { authenticate, authorize } from "../middleware/auth.js";

const postRouter = Router();

// CREATE post
postRouter.post(
  "/",
  authenticate,
  validate(createPostSchema, "body"),
  postController.createPost,
);

// GET all posts (with pagination)
postRouter.get("/", postController.getPosts);

// GET draft posts
postRouter.get("/drafts", authenticate, postController.getDraftPosts);
//get single draft post by id
postRouter.get("/drafts/:id", authenticate, postController.getDraftPostById);
// GET single post
postRouter.get("/:id", postController.getPostById);

// UPDATE post
postRouter.put(
  "/:id",
  authenticate,
  validate(updatePostSchema, "body"),
  postController.updatePost,
);

// DELETE post
postRouter.delete("/:id", authenticate, postController.deletePost);

//admin/super_admin hard delete
postRouter.delete(
  "/hard/:id",
  authenticate,
  authorize("admin", "super_admin"),
  postController.hardDeletePost,
);

export default postRouter;

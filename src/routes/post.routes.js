import { Router } from "express";
import * as postController from "../controllers/post.controllers.js";
import { validate } from "../middleware/validator.js";
import {
  createPostSchema,
  updatePostSchema,
} from "../validators/postSchemas.js";
import {
  authenticate,
  authorize,
  optionalAuthenticate,
} from "../middleware/auth.js";

const postRouter = Router();

// CREATE post
postRouter.post(
  "/",
  authenticate,
  validate(createPostSchema, "body"),
  postController.createPost,
);

// GET all posts (with pagination)
postRouter.get("/", optionalAuthenticate, postController.getPosts);

//get post stats for user
postRouter.get("/stats", authenticate, postController.getUserStats);

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

// GET all posts including deleted  admin/super_admin only
postRouter.get(
  "/admin/all",
  authenticate,
  authorize("admin", "super_admin"),
  postController.getAllPostsAdmin,
);

// restore a soft-deleted post  admin/super admin only
postRouter.patch(
  "/restore/:id",
  authenticate,
  authorize("admin", "super_admin"),
  postController.restorePost,
);

export default postRouter;

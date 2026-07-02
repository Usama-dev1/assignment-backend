import { Router } from "express";
import * as postController from "../controllers/post.controllers.js";
import { validate } from "../middleware/validator.js";
import { createPostSchema } from "../validators/createPostSchema.js";
import { updatePostSchema } from "../validators/updatePostSchema.js";

const postRouter = Router();

// CREATE post
postRouter.post(
  "/",
  validate(createPostSchema, "body"),
  postController.createPost,
);

// GET all posts (with pagination)
postRouter.get("/", postController.getPosts);

// GET draft posts
postRouter.get("/drafts", postController.getDraftPosts);
//get single draft post by id
postRouter.get("/drafts/:id", postController.getDraftPostById);
// GET single post
postRouter.get("/:id", postController.getPostById);

// UPDATE post
postRouter.put(
  "/:id",
  validate(updatePostSchema, "body"),
  postController.updatePost,
);

// DELETE post
postRouter.delete("/:id", postController.deletePost);

//admin/super_admin hard delete
postRouter.delete("/hard/:id", postController.hardDeletePost);

export default postRouter;

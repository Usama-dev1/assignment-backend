import { Router } from "express";
import * as postController from "../controllers/post.controller.js";
import { validate } from "../middleware/validator.js";
import { createPostSchema } from "../validators/createPostSchema.js";

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

// GET single post
postRouter.get("/:id", postController.getPostById);

// UPDATE post
postRouter.put("/:id", postController.updatePost);

// DELETE post
postRouter.delete("/:id", postController.deletePost);

export default postRouter;

import express from "express";
import * as likeController from "../controllers/like.controllers.js";
import { authenticate } from "../middleware/auth.js";

const likeRouter = express.Router({ mergeParams: true });
likeRouter.get("/", likeController.getPostLikes);
likeRouter.post("/", authenticate, likeController.createLike);
likeRouter.delete("/", authenticate, likeController.removeLike);

export default likeRouter;

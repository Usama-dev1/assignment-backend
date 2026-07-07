import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import cors from "cors";
import postRouter from "./routes/post.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import categoryRouter from "./routes/category.routes.js";
import authRouter from "./routes/auth.routes.js";
import superAdminRouter from "./routes/superAdmin.routes.js";

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: true, //later add Client URL
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRouter);
app.use("/api/auth", superAdminRouter);
app.use("/api/post", postRouter);
app.use("/api/post/:postId/comments", commentRouter);
app.use("/api/post/:postId/likes", likeRouter);
app.use("/api/categories", categoryRouter);

export default app;

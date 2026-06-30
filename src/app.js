import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import config from "./config/config.js";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

export default app;

import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!global._mongoose) {
    global._mongoose = { conn: null, promise: null };
  }

  if (!global._mongoose.promise) {
    const opts = {
      bufferCommands: false,
      bufferMaxEntries: 0,
    };

    global._mongoose.promise = mongoose
      .connect(config.MONGO_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance.connection;
      })
      .catch((error) => {
        global._mongoose.promise = null;
        throw error;
      });
  }

  try {
    global._mongoose.conn = await global._mongoose.promise;
    console.log("MongoDB Connected Successfully");
    return global._mongoose.conn;
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;

import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [10, "Title must be at least 10 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [100, "Content must be at least 100 characters"],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    draft: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Post = mongoose.model("Post", postSchema);
export default Post;

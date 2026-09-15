import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    buyLink: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      default: "Renowned Author",
      trim: true,
    },
    category: {
      type: String,
      default: "Technology",
      trim: true,
    },
    price: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", bookSchema);
export default Book;

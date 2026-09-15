import express from "express";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";
import { getAllBooks, addBook, deleteBook } from "../controllers/bookController.js";

const bookRouter = express.Router();

// Public: Get all books
bookRouter.get("/all", getAllBooks);

// Protected: Add a new book (with optional file upload or direct URL)
bookRouter.post("/add", isAuth, upload.single("image"), addBook);

// Protected: Delete book by ID
bookRouter.delete("/:id", isAuth, deleteBook);

export default bookRouter;

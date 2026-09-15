import Book from "../models/bookModel.js";
import uploadOnCloudinary from "../configs/cloudinary.js";

// Initial 6 demo books with high-impact tech book titles, cover images & buy links
const DEMO_BOOKS = [
  {
    title: "Clean Code: A Handbook of Agile Software Craftsmanship",
    author: "Robert C. Martin",
    category: "Software Engineering",
    price: "$34.99",
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80",
    buyLink: "https://www.amazon.com/dp/0132350882",
  },
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    category: "Distributed Systems",
    price: "$39.99",
    description: "The big ideas behind reliable, scalable, and maintainable systems in modern cloud software architectures.",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    buyLink: "https://www.amazon.com/dp/1449373321",
  },
  {
    title: "The Pragmatic Programmer: Your Journey To Mastery",
    author: "David Thomas, Andrew Hunt",
    category: "Career Mastery",
    price: "$36.50",
    description: "One of the most significant books in computer science, illustrating the core values of developer craftsmanship.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    buyLink: "https://www.amazon.com/dp/0135957052",
  },
  {
    title: "Cracking the Coding Interview",
    author: "Gayle Laakmann McDowell",
    category: "Interview Prep",
    price: "$29.99",
    description: "189 programming interview questions, ranging from the basics to the trickiest algorithm problems.",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80",
    buyLink: "https://www.amazon.com/dp/0984782850",
  },
  {
    title: "System Design Interview – An Insider's Guide",
    author: "Alex Xu",
    category: "Architecture",
    price: "$38.00",
    description: "Step-by-step framework to tackle open-ended system design questions in FAANG and tier-1 tech interviews.",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    buyLink: "https://www.amazon.com/dp/B08B35DF1M",
  },
  {
    title: "You Don't Know JS Yet: Get Started",
    author: "Kyle Simpson",
    category: "JavaScript",
    price: "$22.50",
    description: "Deep dive into the core mechanisms of JavaScript, scope, closures, prototypes, and asynchronous execution.",
    image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
    buyLink: "https://www.amazon.com/dp/B084BNNG34",
  },
];

// Fetch all books
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      books: books || [],
      count: books ? books.length : 0,
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch books: ${error.message}`,
    });
  }
};

// Add a new book (Photo file upload or direct URL + Buy Link)
export const addBook = async (req, res) => {
  try {
    const { title, buyLink, author, price, category, description } = req.body;

    let imageUrl = req.body.image;

    // Handle file upload via multer
    if (req.file) {
      const uploaded = await uploadOnCloudinary(req.file.path);
      if (uploaded) {
        imageUrl = uploaded;
      }
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Book photo/image is required (either upload file or provide image URL)",
      });
    }

    if (!buyLink) {
      return res.status(400).json({
        success: false,
        message: "Buy Link is required",
      });
    }

    const newBook = await Book.create({
      title: title?.trim() || "Recommended Tech Book",
      image: imageUrl,
      buyLink: buyLink.trim(),
      author: author?.trim() || "Author",
      price: price?.trim() || "",
      category: category?.trim() || "Tech",
      description: description?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Book added successfully",
      book: newBook,
    });
  } catch (error) {
    console.error("Error adding book:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to add book: ${error.message}`,
    });
  }
};

// Delete a book by ID
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);

    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    return res.status(500).json({
      success: false,
      message: `Failed to delete book: ${error.message}`,
    });
  }
};

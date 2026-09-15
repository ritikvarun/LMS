import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { submitContact, getAllContacts, deleteContact } from "../controllers/contactController.js";

const contactRouter = express.Router();

// Public: Submit a contact message
contactRouter.post("/submit", submitContact);

// Protected: View all contacts & delete contacts
contactRouter.get("/all", isAuth, getAllContacts);
contactRouter.delete("/:id", isAuth, deleteContact);

export default contactRouter;

import express from "express";
import { submitContact, getAllContacts, deleteContact } from "../controllers/contactController.js";

const contactRouter = express.Router();

contactRouter.post("/submit", submitContact);
contactRouter.get("/all", getAllContacts);
contactRouter.delete("/:id", deleteContact);

export default contactRouter;

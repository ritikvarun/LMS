import Contact from "../models/contactModel.js";

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
    }

    const newContact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      subject: subject ? subject.trim() : "General Inquiry",
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully! Our team will get back to you shortly.",
      contact: newContact,
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again later.",
    });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve contact messages.",
    });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await Contact.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete contact message.",
    });
  }
};

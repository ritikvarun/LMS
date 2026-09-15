import express from "express";
import { createOrder, verifyPayment, validateCoupon } from "../controllers/orderController.js";

const paymentRouter = express.Router();

paymentRouter.post("/create-order", createOrder);
paymentRouter.post("/verify-payment", verifyPayment);
paymentRouter.post("/apply-coupon", validateCoupon);

export default paymentRouter;
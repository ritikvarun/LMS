import crypto from "crypto";
import Course from "../models/courseModel.js";
import razorpay from "razorpay";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import dotenv from "dotenv";
dotenv.config();

export const COUPONS = {
  TODAY: { code: "TODAY", discountPercent: 50, expires: "06 Sep 2026", description: "50% off flat on all courses" },
  RAIL20: { code: "RAIL20", discountPercent: 20, expires: "17 Sep 2026", description: "20% off on all batches" },
  CODE20: { code: "CODE20", discountPercent: 20, expires: "31 Dec 2026", description: "20% off CodeCrafters coupon" },
  SPECIAL30: { code: "SPECIAL30", discountPercent: 30, expires: "31 Dec 2026", description: "30% special discount" },
};

const getRazorpayInstance = () => {
  const key_id = (process.env.RAZORPAY_KEY_ID || "").trim();
  const key_secret = (process.env.RAZORPAY_SECRET || "").trim();
  return new razorpay({
    key_id,
    key_secret,
  });
};

export const validateCoupon = async (req, res) => {
  try {
    const { couponCode, coursePrice } = req.body;
    if (!couponCode) {
      return res.status(400).json({ success: false, message: "Please enter a coupon code." });
    }

    const code = couponCode.trim().toUpperCase();
    const coupon = COUPONS[code];

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon code. Try using 'TODAY' or 'RAIL20'.",
      });
    }

    const originalPrice = Number(coursePrice) || 0;
    const discountAmount = Math.round((originalPrice * coupon.discountPercent) / 100);
    const discountedPrice = Math.max(0, originalPrice - discountAmount);

    return res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        expires: coupon.expires,
        description: coupon.description,
      },
      originalPrice,
      discountAmount,
      discountedPrice,
      message: `Coupon '${coupon.code}' applied! You saved ₹${discountAmount} (${coupon.discountPercent}% OFF).`,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return res.status(500).json({ success: false, message: "Failed to validate coupon." });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { courseId, userId, couponCode } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    let finalPrice = Number(course.price) || 0;

    // Apply coupon if provided
    if (couponCode && typeof couponCode === "string") {
      const code = couponCode.trim().toUpperCase();
      const coupon = COUPONS[code];
      if (coupon) {
        const discountAmount = Math.round((finalPrice * coupon.discountPercent) / 100);
        finalPrice = Math.max(0, finalPrice - discountAmount);
      }
    }

    // If free course or discounted to 0, directly enroll
    if (finalPrice <= 0 || !course.price || course.isFree) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { enrolledCourses: courseId },
      });
      await Course.findByIdAndUpdate(courseId, {
        $addToSet: { enrolledStudents: userId },
      });
      return res.status(200).json({ freeEnrollment: true, message: "Enrolled Successfully!" });
    }

    const options = {
      amount: Math.round(finalPrice * 100), // amount in paise
      currency: "INR",
      receipt: `rcpt_${courseId.toString().slice(-16)}_${Date.now()}`.slice(-40),
    };

    const rzp = getRazorpayInstance();
    const order = await rzp.orders.create(options);
    return res.status(200).json({ ...order, finalPrice });
  } catch (err) {
    console.error("Order creation error:", err);
    return res.status(500).json({ message: `Order creation failed: ${err.message || err}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const razorpay_order_id = (req.body.razorpay_order_id || req.body.orderId || req.body.order_id || "").trim();
    const razorpay_payment_id = (req.body.razorpay_payment_id || req.body.paymentId || req.body.payment_id || "").trim();
    const razorpay_signature = (req.body.razorpay_signature || req.body.signature || "").trim();
    const { courseId, userId } = req.body;

    console.log("Verifying payment payload:", {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      hasSignature: Boolean(razorpay_signature),
      courseId,
      userId,
    });

    if (!courseId || !userId) {
      return res.status(400).json({ message: "Course ID and User ID are required." });
    }

    let isVerified = false;
    const secret = (process.env.RAZORPAY_SECRET || "").trim();

    // 1. Official HMAC-SHA256 signature verification (Razorpay standard)
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature && secret) {
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature.toLowerCase() === razorpay_signature.toLowerCase()) {
        isVerified = true;
        console.log("✓ Razorpay HMAC signature matched successfully!");
      } else {
        console.warn("HMAC signature mismatch:", { generated: generatedSignature, received: razorpay_signature });
      }
    }

    // 2. Fallback verification via Razorpay API (handles test card async status & authorized cases)
    if (!isVerified && razorpay_order_id) {
      try {
        const rzp = getRazorpayInstance();
        const orderInfo = await rzp.orders.fetch(razorpay_order_id);
        console.log("Order status from Razorpay API:", orderInfo?.status);

        if (orderInfo && (orderInfo.status === "paid" || orderInfo.status === "attempted")) {
          if (razorpay_payment_id) {
            const paymentInfo = await rzp.payments.fetch(razorpay_payment_id);
            console.log("Payment status from Razorpay API:", paymentInfo?.status);
            if (paymentInfo && (paymentInfo.status === "captured" || paymentInfo.status === "authorized")) {
              isVerified = true;
            }
          } else if (orderInfo.status === "paid") {
            isVerified = true;
          }
        }
      } catch (fetchErr) {
        console.warn("Razorpay API fallback check warning:", fetchErr.message);
      }
    }

    if (!isVerified) {
      return res.status(400).json({
        message: "Payment verification failed: Signature mismatch or payment unconfirmed.",
      });
    }

    // 3. Atomically add to User and Course enrollments
    const userUpdate = await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });
    if (!userUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const courseUpdateFields = {
      $addToSet: { enrolledStudents: userId },
    };
    if (!course.level || course.level === "") {
      courseUpdateFields.level = "Beginner";
    }

    await Course.findByIdAndUpdate(courseId, courseUpdateFields);

    // 4. Save order audit record in Order model
    try {
      await Order.create({
        course: courseId,
        student: userId,
        razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id || "direct",
        razorpay_signature: razorpay_signature || "verified",
        amount: course.price || 0,
        currency: "INR",
        isPaid: true,
        paidAt: new Date(),
      });
    } catch (orderSaveErr) {
      console.warn("Notice: Order record save error (enrollment still successful):", orderSaveErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified and enrollment successful!",
    });
  } catch (error) {
    console.error("Internal payment verification error:", error);
    return res.status(500).json({
      message: `Internal error during payment verification: ${error.message || error}`,
    });
  }
};

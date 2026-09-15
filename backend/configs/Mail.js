import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});


const sendMail = async (to, otp) => {
    transporter.sendMail({
        from: `"CodeCrafters Academy" <${process.env.EMAIL}>`,
        to: to,
        subject: "CodeCrafters - Reset Your Password",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #4f46e5; margin-bottom: 8px;">CodeCrafters</h2>
                <p style="color: #475569; font-size: 15px;">You requested a password reset. Use the One-Time Password (OTP) below to reset your credentials:</p>
                <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1e293b;">${otp}</span>
                </div>
                <p style="color: #64748b; font-size: 13px;">This OTP is valid for 5 minutes. If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="color: #94a3b8; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} CodeCrafters Academy. All rights reserved.</p>
            </div>
        `
    })
}


export default sendMail
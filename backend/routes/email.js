// routes/email.js
import express from "express";
import { authenticate } from "../middleware/auth.js";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/User.js";

const router = express.Router();

// Send contact email (public - no auth required)
router.post("/contact", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Send email to admin/support
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        const emailSubject = `Contact Form: ${subject}`;
        const emailText = `
New contact form submission:

From: ${name} <${email}>
Subject: ${subject}

Message:
${message}

---
Sent from Green Web App contact form
        `;

        const info = await sendEmail(adminEmail, emailSubject, emailText);

        // Optional: Send confirmation to user
        try {
            await sendEmail(
                email,
                "Thank you for contacting Green Life",
                `Hi ${name},

Thank you for reaching out to Green Life! We've received your message and will get back to you soon.

Your message:
"${message}"

Best regards,
Green Life Team
                `
            );
        } catch (confirmErr) {
            console.log("Confirmation email failed, but contact email sent:", confirmErr.message);
        }

        res.status(200).json({
            message: "Email sent successfully!",
            messageId: info.messageId
        });

    } catch (err) {
        console.error("Contact email error:", err);
        res.status(500).json({ message: "Failed to send email", error: err.message });
    }
});

// Resend welcome email (authenticated users)
router.post("/resend-welcome", authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const info = await sendEmail(
            user.email,
            'Welcome to Green Life 🌿',
            `Welcome back to Green Life! 🌱

We're glad you're here. Explore our features and continue your journey towards sustainability.

Happy Growing! 🌼
– The Green Life Team`
        );

        res.status(200).json({
            message: "Welcome email resent successfully!",
            messageId: info.messageId
        });

    } catch (err) {
        console.error("Resend welcome email error:", err);
        res.status(500).json({ message: "Failed to resend email", error: err.message });
    }
});

export default router;
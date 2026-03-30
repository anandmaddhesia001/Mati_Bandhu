// routes/email.js
import express from "express";
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

        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (!process.env.ADMIN_EMAIL) {
            return res.status(500).json({
                message: "Admin email not configured"
            });
        }

        const adminEmail = process.env.ADMIN_EMAIL;

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

        // Confirmation email (non-blocking)
        try {
            await sendEmail(
                email,
                "Thank you for contacting Green Life",
                `Hi ${name},

Thank you for reaching out to Green Life! We've received your message.

Your message:
"${message}"

Best regards,
Green Life Team`
            );
        } catch (confirmErr) {
            console.error("Confirmation email failed:", confirmErr.message);
        }

        res.status(200).json({
            message: "Email sent successfully!",
            messageId: info.id
        });

    } catch (err) {
        console.error("Contact email error:", err);
        res.status(500).json({
            message: "Failed to send email",
            error: err.message
        });
    }
});

export default router;
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (to, subject, text) => {
    console.log("📨 Preparing to send email to:", to);

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"Green Web App" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
        });

        console.log("✅ Email sent successfully!");
        console.log("   Message ID:", info.messageId);
        console.log("   To:", to);
        console.log("   Subject:", subject);
        console.log("   Response:", info.response);

        return info;
    } catch (err) {
        console.error("❌ Email send failed:");
        console.error("   Error:", err.message);
        console.error("   To:", to);
        console.error("   Subject:", subject);
        throw err;
        throw err;
    }
};

export default sendEmail;
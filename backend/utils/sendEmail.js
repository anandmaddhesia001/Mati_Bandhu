import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text) => {
    console.log("📨 Sending email to:", to);

    try {
        const response = await resend.emails.send({
            from: "Green Life <noreply@greenweb.com>", // works without domain setup
            to,
            subject,
            text,
        });

        console.log("✅ Email sent:", response.id);
        return response;

    } catch (err) {
        console.error("❌ Email send failed:", err.message);
        throw err;
    }
};

export default sendEmail;
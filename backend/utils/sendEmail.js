import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text) => {
    const TEST_EMAIL = "ak4889836@gmail.com";
    console.log("📨 Sending email to:", TEST_EMAIL);

    try {
        const response = await resend.emails.send({
            from: "Test <onboarding@resend.dev>", // works without domain setup
            to: TEST_EMAIL,
            subject,
            text,
        });

        console.log("FULL RESPONSE:", JSON.stringify(response, null, 2));
        return response;

    } catch (err) {
        console.error("❌ Email send failed:", err.message);
        throw err;
    }
};

export default sendEmail;
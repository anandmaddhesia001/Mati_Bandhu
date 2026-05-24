// routes/gemini.js

import express from "express";
import axios from "axios";

const router = express.Router();

router.post("/chat", async (req, res) => {
    console.log("🔥 HIT GEMINI ROUTE");
    console.log("📥 Received messages:", req.body.messages);

  try {
    const { messages } = req.body;

    const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-002:generateContent?key=${process.env.GEMINI_API_KEY}`,
        { contents: messages },
        { headers: { "Content-Type": "application/json" } }
    );
    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ reply: text });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Gemini API failed" });
  }
});

export default router;
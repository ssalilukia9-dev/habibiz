import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Proxy
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { contents, systemInstruction } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
      }

      const client = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          }
        }
      });

      const text = response.text || "I apologize, I couldn't process that.";
      res.json({ text });
    } catch (error: any) {
      console.error("Gemini API Error details:", error?.message || error);
      
      // Check for specific error types to guide the user
      let errorMessage = "Failed to communicate with AI";
      if (error?.message) {
        if (error.message.includes("API_KEY_INVALID") || error.message.includes("403")) {
          errorMessage = "Invalid Gemini API Key. Please update it in Settings > Secrets.";
        } else if (error.message.includes("quota") || error.message.includes("429")) {
          errorMessage = "Gemini API quota exceeded. Please check your billing or quota limits.";
        } else if (error.message.includes("NOT_FOUND") || error.message.includes("model")) {
          errorMessage = "The selected AI model is currently unavailable.";
        }
      }
      
      res.status(500).json({ error: errorMessage, details: error?.message });
    }
  });

  // Voice Reflection Analysis and Verse Suggestion Endpoint
  app.post("/api/ai/reflection", async (req, res) => {
    try {
      const { text } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
      }

      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Reflection text is required" });
      }

      const client = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Here is my reflection about my day: "${text}"\n\nPlease find 3-4 comforting, guiding Quranic verses for me.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: {
            parts: [{ text: `You are a compassionate, scholarly Quranic counseling advisor.
Given a user's personal reflection about their day, you must identify 3-4 highly relevant Quranic verses that address their feelings, thoughts, or situations (such as patience, gratitude, comfort, hope, struggle, anxiety, or success).
For each verse, you MUST return a structured JSON object containing:
- "surah": the Surah number (integer)
- "ayah": the Ayah number (integer)
- "surahName": the name of the Surah in English transliteration (e.g., "Al-Baqarah")
- "text": the exact Arabic text of the verse
- "translation": the English translation (Sahih International)
- "relevance": a beautifully written, comforting, and spiritually uplifting explanation (2-3 sentences) of why this verse is relevant to their specific reflection and how they can apply it in their daily life.

Your output MUST be a valid JSON array of these objects. Do not include markdown blocks, conversational preamble, or code block backticks. Only return the raw JSON array.` }]
          },
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text || "[]";
      let parsedVerses = [];
      try {
        parsedVerses = JSON.parse(responseText.trim());
      } catch (e) {
        console.error("Failed to parse Gemini response as JSON. Raw text:", responseText);
        try {
          const stripped = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
          parsedVerses = JSON.parse(stripped);
        } catch (innerErr) {
          throw new Error("Could not parse verse suggestions. Please try again.");
        }
      }

      res.json({ verses: parsedVerses });
    } catch (error: any) {
      console.error("Gemini Reflection Error:", error);
      res.status(500).json({ error: error?.message || "Failed to analyze reflection" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Aladhan Prayer Times Proxy
  app.get("/api/proxy/aladhan/*", async (req, res) => {
    try {
      const subPath = req.originalUrl.replace(/^\/api\/proxy\/aladhan\//, '');
      const targetUrl = `https://api.aladhan.com/v1/${subPath}`;
      console.log(`Proxying Aladhan request to: ${targetUrl}`);
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Upstream returned status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error("Aladhan proxy error:", err);
      res.status(502).json({ error: "Failed to fetch from prayer times service", details: err?.message });
    }
  });

  // Alquran Cloud Proxy
  app.get("/api/proxy/alquran/*", async (req, res) => {
    try {
      const subPath = req.originalUrl.replace(/^\/api\/proxy\/alquran\//, '');
      const targetUrl = `https://api.alquran.cloud/v1/${subPath}`;
      console.log(`Proxying Alquran request to: ${targetUrl}`);
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Upstream returned status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      console.error("Alquran proxy error:", err);
      res.status(502).json({ error: "Failed to fetch from Quran service", details: err?.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static files from dist/
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

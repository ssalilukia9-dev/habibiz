var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { contents, systemInstruction } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
      }
      const client = new import_genai.GoogleGenAI({ apiKey });
      const response = await client.models.generateContent({
        model: "gemini-1.5-flash",
        contents,
        config: {
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          }
        }
      });
      const text = response.text || "I apologize, I couldn't process that.";
      res.json({ text });
    } catch (error) {
      console.error("Gemini API Error details:", error?.message || error);
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
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app.get("/api/proxy/aladhan/*", async (req, res) => {
    try {
      const subPath = req.originalUrl.replace(/^\/api\/proxy\/aladhan\//, "");
      const targetUrl = `https://api.aladhan.com/v1/${subPath}`;
      console.log(`Proxying Aladhan request to: ${targetUrl}`);
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Upstream returned status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error("Aladhan proxy error:", err);
      res.status(502).json({ error: "Failed to fetch from prayer times service", details: err?.message });
    }
  });
  app.get("/api/proxy/alquran/*", async (req, res) => {
    try {
      const subPath = req.originalUrl.replace(/^\/api\/proxy\/alquran\//, "");
      const targetUrl = `https://api.alquran.cloud/v1/${subPath}`;
      console.log(`Proxying Alquran request to: ${targetUrl}`);
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Upstream returned status ${response.status}`);
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      console.error("Alquran proxy error:", err);
      res.status(502).json({ error: "Failed to fetch from Quran service", details: err?.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

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
var import_app = require("firebase-admin/app");
var import_firestore = require("firebase-admin/firestore");
var import_fs = __toESM(require("fs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
import_dotenv.default.config();
var firebaseConfigRaw = JSON.parse(
  import_fs.default.readFileSync(import_path.default.join(process.cwd(), "firebase-applet-config.json"), "utf-8")
);
var app;
if ((0, import_app.getApps)().length === 0) {
  app = (0, import_app.initializeApp)({
    projectId: firebaseConfigRaw.projectId
  });
} else {
  app = (0, import_app.getApp)();
}
var fdb = (0, import_firestore.getFirestore)(app, firebaseConfigRaw.firestoreDatabaseId || "(default)");
function hashPassword(password) {
  return import_crypto.default.createHash("sha256").update(password).digest("hex");
}
async function startServer() {
  const app2 = (0, import_express.default)();
  const PORT = 3e3;
  app2.use(import_express.default.json());
  async function validateSession(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split("Bearer ")[1];
    const sessionDoc = await fdb.collection("user_sessions").doc(token).get();
    if (!sessionDoc.exists) {
      return null;
    }
    const session = sessionDoc.data();
    if (session.expiresAt < Date.now()) {
      await fdb.collection("user_sessions").doc(token).delete();
      return null;
    }
    return session;
  }
  app2.post("/api/db/auth/register", async (req, res) => {
    try {
      const { email, password, displayName } = req.body;
      if (!email || !password || !displayName) {
        return res.status(400).json({ error: "Please enter your email, password, and display name." });
      }
      const emailKey = email.trim().toLowerCase();
      const userRef = fdb.collection("app_users").doc(emailKey);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        return res.status(400).json({ error: "An account already exists with this email. Please switch to Sign In." });
      }
      const uid = "rest_" + import_crypto.default.createHash("md5").update(emailKey).digest("hex").substring(0, 12);
      const passwordHash = hashPassword(password);
      const newUser = {
        uid,
        email: emailKey,
        passwordHash,
        displayName: displayName.trim(),
        hasanat: 0,
        streak: 1,
        createdAt: import_firestore.FieldValue.serverTimestamp(),
        lastSeen: import_firestore.FieldValue.serverTimestamp(),
        onboardingCompleted: true,
        bookmarks: []
      };
      await userRef.set(newUser);
      const token = "session_" + import_crypto.default.randomBytes(24).toString("hex");
      await fdb.collection("user_sessions").doc(token).set({
        uid,
        email: emailKey,
        createdAt: import_firestore.FieldValue.serverTimestamp(),
        expiresAt: Date.now() + 30 * 24 * 3600 * 1e3
        // 30 days
      });
      const { passwordHash: _, ...userResponse } = newUser;
      res.json({ token, user: userResponse });
    } catch (err) {
      console.error("Register Error:", err);
      res.status(500).json({ error: "Registration service encountered a temporary error. Please try again or use Instant Guest entry.", details: err?.message });
    }
  });
  app2.post("/api/db/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Please enter both your email address and password." });
      }
      const emailKey = email.trim().toLowerCase();
      const userRef = fdb.collection("app_users").doc(emailKey);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "No account found with this email. Switch to 'Create Account' to sign up in 5 seconds!" });
      }
      const userData = userDoc.data();
      const passwordHash = hashPassword(password);
      if (userData.passwordHash !== passwordHash) {
        return res.status(401).json({ error: "Incorrect password. Please verify your password and try again." });
      }
      const token = "session_" + import_crypto.default.randomBytes(24).toString("hex");
      await fdb.collection("user_sessions").doc(token).set({
        uid: userData.uid,
        email: emailKey,
        createdAt: import_firestore.FieldValue.serverTimestamp(),
        expiresAt: Date.now() + 30 * 24 * 3600 * 1e3
        // 30 days
      });
      const { passwordHash: _, ...userResponse } = userData;
      res.json({ token, user: userResponse });
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ error: "Login service encountered a temporary error. Please try again or use Instant Guest entry.", details: err?.message });
    }
  });
  app2.post("/api/db/user/sync", async (req, res) => {
    try {
      const session = await validateSession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized: Invalid or expired session" });
      }
      const emailKey = session.email;
      const { hasanat, streak, bookmarks, bio, displayName } = req.body;
      const updateFields = {
        lastSeen: import_firestore.FieldValue.serverTimestamp()
      };
      if (typeof hasanat === "number") updateFields.hasanat = hasanat;
      if (typeof streak === "number") updateFields.streak = streak;
      if (Array.isArray(bookmarks)) updateFields.bookmarks = bookmarks;
      if (typeof bio === "string") updateFields.bio = bio;
      if (typeof displayName === "string") updateFields.displayName = displayName;
      await fdb.collection("app_users").doc(emailKey).update(updateFields);
      res.json({ success: true });
    } catch (err) {
      console.error("Sync Error:", err);
      res.status(500).json({ error: "Failed to sync user data", details: err?.message });
    }
  });
  app2.get("/api/db/user/profile", async (req, res) => {
    try {
      const session = await validateSession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized: Invalid or expired session" });
      }
      const emailKey = session.email;
      const userDoc = await fdb.collection("app_users").doc(emailKey).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: "User profile not found" });
      }
      const userData = userDoc.data();
      const { passwordHash: _, ...userResponse } = userData;
      res.json({ user: userResponse });
    } catch (err) {
      console.error("Profile Fetch Error:", err);
      res.status(500).json({ error: "Failed to retrieve profile", details: err?.message });
    }
  });
  app2.post("/api/db/feed/posts", async (req, res) => {
    try {
      const session = await validateSession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { content, category, image, poll } = req.body;
      const userDoc = await fdb.collection("app_users").doc(session.email).get();
      const userDisplayName = userDoc.exists ? userDoc.data().displayName : "Spiritual Soul";
      const postData = {
        userId: session.uid,
        user: userDisplayName,
        content,
        category: category || "How I Feel",
        time: import_firestore.Timestamp.now(),
        supportCount: 0,
        reconsiderCount: 0,
        userVotes: {},
        comments: [],
        isFlagged: false,
        approved: true,
        image: image || null,
        poll: poll || null
      };
      const docRef = await fdb.collection("posts").add(postData);
      res.json({ id: docRef.id, ...postData });
    } catch (err) {
      console.error("Feed Post Add Error:", err);
      res.status(500).json({ error: "Failed to add feed post" });
    }
  });
  app2.get("/api/db/feed/posts", async (req, res) => {
    try {
      const snapshot = await fdb.collection("posts").orderBy("time", "desc").limit(50).get();
      const list = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timeDisplay: data.time ? new Date(data.time.seconds * 1e3).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"
        };
      });
      res.json(list);
    } catch (err) {
      console.error("Feed Posts Fetch Error:", err);
      res.status(500).json({ error: "Failed to fetch feed posts" });
    }
  });
  app2.post("/api/db/feed/vote", async (req, res) => {
    try {
      const session = await validateSession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { postId, type } = req.body;
      if (!postId || !type) {
        return res.status(400).json({ error: "postId and type are required" });
      }
      const postRef = fdb.collection("posts").doc(postId);
      const postDoc = await postRef.get();
      if (!postDoc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }
      const postData = postDoc.data();
      const userVotes = postData.userVotes || {};
      const currentVote = userVotes[session.uid];
      let supportChange = 0;
      let reconsiderChange = 0;
      if (currentVote === type) {
        delete userVotes[session.uid];
        if (type === "support") supportChange = -1;
        else reconsiderChange = -1;
      } else {
        if (currentVote) {
          if (currentVote === "support") supportChange = -1;
          else reconsiderChange = -1;
        }
        userVotes[session.uid] = type;
        if (type === "support") supportChange = 1;
        else reconsiderChange = 1;
      }
      const updates = {
        userVotes,
        supportCount: import_firestore.FieldValue.increment(supportChange),
        reconsiderCount: import_firestore.FieldValue.increment(reconsiderChange)
      };
      await postRef.update(updates);
      res.json({ success: true });
    } catch (err) {
      console.error("Feed Vote Error:", err);
      res.status(500).json({ error: "Failed to submit vote" });
    }
  });
  app2.delete("/api/db/feed/posts/:postId", async (req, res) => {
    try {
      const session = await validateSession(req);
      const { postId } = req.params;
      if (!postId) {
        return res.status(400).json({ error: "postId is required" });
      }
      const postRef = fdb.collection("posts").doc(postId);
      const postDoc = await postRef.get();
      if (postDoc.exists) {
        const data = postDoc.data();
        if (session && data && data.userId && data.userId !== session.uid && session.role !== "admin") {
        }
        await postRef.delete();
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Feed Post Delete Error:", err);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });
  app2.delete("/api/db/feed/posts/:postId/comments/:commentId", async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const postRef = fdb.collection("posts").doc(postId);
      const postDoc = await postRef.get();
      if (postDoc.exists) {
        const postData = postDoc.data();
        const comments = postData.comments || [];
        const filtered = comments.filter((c) => c.id !== commentId);
        await postRef.update({ comments: filtered });
      }
      res.json({ success: true });
    } catch (err) {
      console.error("Feed Comment Delete Error:", err);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });
  app2.get("/api/db/chat/rooms", async (req, res) => {
    try {
      const snapshot = await fdb.collection("rooms").orderBy("timestamp", "desc").get();
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      res.json(list);
    } catch (err) {
      console.error("Chat Rooms Fetch Error:", err);
      res.status(500).json({ error: "Failed to fetch chat rooms" });
    }
  });
  app2.post("/api/db/chat/rooms", async (req, res) => {
    try {
      const session = await validateSession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: "Room title is required" });
      }
      const roomData = {
        title,
        createdBy: session.uid,
        timestamp: import_firestore.Timestamp.now()
      };
      const docRef = await fdb.collection("rooms").add(roomData);
      res.json({ id: docRef.id, ...roomData });
    } catch (err) {
      console.error("Create Chat Room Error:", err);
      res.status(500).json({ error: "Failed to create room" });
    }
  });
  app2.post("/api/db/feed/posts/:postId/comments", async (req, res) => {
    try {
      const session = await validateSession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { postId } = req.params;
      const { text } = req.body;
      if (!postId || !text) {
        return res.status(400).json({ error: "postId and text are required" });
      }
      const postRef = fdb.collection("posts").doc(postId);
      const postDoc = await postRef.get();
      if (!postDoc.exists) {
        return res.status(404).json({ error: "Post not found" });
      }
      const userDoc = await fdb.collection("app_users").doc(session.email).get();
      const userDisplayName = userDoc.exists ? userDoc.data().displayName : "Spiritual Soul";
      const newComment = {
        id: `c-${Date.now()}`,
        userId: session.uid,
        user: userDisplayName,
        text,
        time: (/* @__PURE__ */ new Date()).toISOString(),
        replies: []
      };
      const postData = postDoc.data();
      const comments = postData.comments || [];
      comments.push(newComment);
      await postRef.update({ comments });
      res.json({ success: true, comment: newComment });
    } catch (err) {
      console.error("Feed Comment Error:", err);
      res.status(500).json({ error: "Failed to submit comment" });
    }
  });
  app2.post("/api/db/chat/rooms/:roomId/messages", async (req, res) => {
    try {
      const session = await validateSession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const { roomId } = req.params;
      const { text, type } = req.body;
      const userDoc = await fdb.collection("app_users").doc(session.email).get();
      const userDisplayName = userDoc.exists ? userDoc.data().displayName : "Spiritual Soul";
      const messageData = {
        userId: session.uid,
        user: userDisplayName,
        text: text || "",
        type: type || "text",
        timestamp: import_firestore.Timestamp.now()
      };
      await fdb.collection("rooms").doc(roomId).collection("messages").add(messageData);
      res.json({ success: true, message: messageData });
    } catch (err) {
      console.error("Send Chat Message Error:", err);
      res.status(500).json({ error: "Failed to send message" });
    }
  });
  app2.get("/api/db/chat/rooms/:roomId/messages", async (req, res) => {
    try {
      const { roomId } = req.params;
      const snapshot = await fdb.collection("rooms").doc(roomId).collection("messages").orderBy("timestamp", "asc").limit(100).get();
      const list = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? { seconds: data.timestamp.seconds, nanoseconds: data.timestamp.nanoseconds } : null
        };
      });
      res.json(list);
    } catch (err) {
      console.error("Chat Messages Fetch Error:", err);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  app2.post("/api/ai/chat", async (req, res) => {
    try {
      const { contents, systemInstruction } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
      }
      const client = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      let sysInstructionStr = "You are Holy Aliyah (The Nur Companion), the soul of the Holy Quran & Islamic Spiritual Chat. You provide serene, compassionate, scholarly guidance rooted in the Holy Quran and authentic Sunnah.";
      if (typeof systemInstruction === "string" && systemInstruction.trim()) {
        sysInstructionStr = systemInstruction.trim();
      } else if (systemInstruction?.parts?.[0]?.text) {
        sysInstructionStr = systemInstruction.parts[0].text;
      }
      let normalizedContents = contents;
      if (Array.isArray(contents)) {
        const cleaned = [];
        for (const item of contents) {
          const role = item.role === "model" ? "model" : "user";
          const validParts = (item.parts || []).filter((p) => {
            if (p.text && typeof p.text === "string" && p.text.trim().length > 0) return true;
            if (p.inlineData && p.inlineData.data) return true;
            return false;
          });
          if (validParts.length > 0) {
            cleaned.push({ role, parts: validParts });
          }
        }
        while (cleaned.length > 0 && cleaned[0].role === "model") {
          cleaned.shift();
        }
        if (cleaned.length === 0) {
          cleaned.push({ role: "user", parts: [{ text: "Assalamu Alaikum" }] });
        }
        const merged = [];
        for (const turn of cleaned) {
          if (merged.length > 0 && merged[merged.length - 1].role === turn.role) {
            merged[merged.length - 1].parts.push(...turn.parts);
          } else {
            merged.push(turn);
          }
        }
        normalizedContents = merged;
      } else if (typeof contents === "string") {
        normalizedContents = [{ role: "user", parts: [{ text: contents }] }];
      }
      const candidateModels = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-2.5-pro"];
      let responseText = null;
      let lastErr = null;
      for (const modelName of candidateModels) {
        try {
          const resp = await client.models.generateContent({
            model: modelName,
            contents: normalizedContents,
            config: {
              systemInstruction: sysInstructionStr
            }
          });
          if (resp && resp.text) {
            responseText = resp.text;
            break;
          }
        } catch (err) {
          lastErr = err;
          console.warn(`Model ${modelName} encountered error or high demand (503/429), trying fallback model...`, err?.message || err);
        }
      }
      if (!responseText) {
        if (lastErr) throw lastErr;
        responseText = "Assalamu Alaikum. May Allah grant you ease, peace, and spiritual tranquility in your daily journey.";
      }
      res.json({ text: responseText });
    } catch (error) {
      console.error("Gemini API Error details:", error?.message || error);
      let errorMessage = "Failed to communicate with AI";
      if (error?.message) {
        if (error.message.includes("API_KEY_INVALID") || error.message.includes("403")) {
          errorMessage = "Invalid Gemini API Key. Please update it in Settings > Secrets.";
        } else if (error.message.includes("quota") || error.message.includes("429")) {
          errorMessage = "Gemini API quota reached. Please try again in a few moments.";
        } else if (error.message.includes("503") || error.message.includes("high demand") || error.message.includes("UNAVAILABLE")) {
          errorMessage = "The AI network is experiencing a temporary spike in traffic. Please try again in a moment.";
        } else if (error.message.includes("NOT_FOUND") || error.message.includes("model")) {
          errorMessage = "The selected AI model is currently unavailable.";
        }
      }
      res.status(500).json({ error: errorMessage, details: error?.message });
    }
  });
  app2.post("/api/ai/reflection", async (req, res) => {
    try {
      const { text } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
      }
      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Reflection text is required" });
      }
      const client = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const prompt = `Here is my reflection about my day: "${text}"

Please find 3-4 comforting, guiding Quranic verses for me.`;
      const candidateModels = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-2.5-pro"];
      let responseText = "[]";
      let lastErr = null;
      for (const modelName of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction: `You are a compassionate, scholarly Quranic counseling advisor.
Given a user's personal reflection about their day, you must identify 3-4 highly relevant Quranic verses that address their feelings, thoughts, or situations (such as patience, gratitude, comfort, hope, struggle, anxiety, or success).
For each verse, you MUST return a structured JSON object containing:
- "surah": the Surah number (integer)
- "ayah": the Ayah number (integer)
- "surahName": the name of the Surah in English transliteration (e.g., "Al-Baqarah")
- "text": the exact Arabic text of the verse
- "translation": the English translation (Sahih International)
- "relevance": a beautifully written, comforting, and spiritually uplifting explanation (2-3 sentences) of why this verse is relevant to their specific reflection and how they can apply it in their daily life.

Your output MUST be a valid JSON array of these objects. Do not include markdown blocks, conversational preamble, or code block backticks. Only return the raw JSON array.`,
              responseMimeType: "application/json"
            }
          });
          if (response && response.text) {
            responseText = response.text;
            break;
          }
        } catch (err) {
          lastErr = err;
          console.warn(`Reflection model ${modelName} error, trying fallback...`, err?.message || err);
        }
      }
      if (responseText === "[]" && lastErr) {
        throw lastErr;
      }
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
    } catch (error) {
      console.error("Gemini Reflection Error:", error);
      res.status(500).json({ error: error?.message || "Failed to analyze reflection" });
    }
  });
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  app2.get("/api/proxy/aladhan/*", async (req, res) => {
    try {
      const subPath = req.originalUrl.replace(/^\/api\/proxy\/aladhan\//, "");
      const targetUrl = `https://api.aladhan.com/v1/${subPath}`;
      console.log(`Proxying Aladhan request to: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
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
  app2.get("/api/proxy/alquran/*", async (req, res) => {
    try {
      const subPath = req.originalUrl.replace(/^\/api\/proxy\/alquran\//, "");
      const targetUrl = `https://api.alquran.cloud/v1/${subPath}`;
      console.log(`Proxying Alquran request to: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
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
  app2.get("/api/proxy/audio", async (req, res) => {
    try {
      const audioUrl = req.query.url;
      if (!audioUrl) {
        return res.status(400).json({ error: "Missing url parameter" });
      }
      const secureUrl = audioUrl.replace(/^http:/, "https:");
      let isAllowed = false;
      let host = "";
      try {
        const parsed = new URL(secureUrl);
        host = parsed.hostname.toLowerCase();
        const allowedHosts = [
          "cdn.alquran.cloud",
          "everyayah.com",
          "cdn.everyayah.com",
          "audio.qurancdn.com",
          "verses.quran.com",
          "download.quranicaudio.com",
          "mirrors.quranicaudio.com",
          "quranicaudio.com",
          "quran.com",
          "cdn.alhamdulillah.com",
          "audio.alhamdulillah.com",
          "alhamdulillah.com",
          "cdn.islamic.network",
          "islamic.network",
          "mp3quran.net",
          "assets.mixkit.co",
          "islamcan.com",
          "www.islamcan.com",
          "archive.org",
          "www.archive.org",
          "translate.google.com",
          "translate.google.co.uk",
          "islamicfinder.org",
          "www.islamicfinder.org"
        ];
        isAllowed = allowedHosts.some((h) => host === h || host.endsWith("." + h));
      } catch (e) {
        isAllowed = false;
      }
      if (!isAllowed) {
        console.warn(`Audio proxy blocked request for forbidden host: ${host} (URL: ${secureUrl})`);
        return res.status(403).json({ error: "Forbidden URL domain" });
      }
      console.log(`Proxying audio request with ranges support to: ${secureUrl}`);
      const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*"
      };
      if (req.headers.range) {
        headers["Range"] = req.headers.range;
      }
      const response = await fetch(secureUrl, { headers });
      if (!response.ok && response.status !== 206) {
        throw new Error(`Upstream returned status ${response.status}`);
      }
      res.status(response.status);
      const headersToForward = [
        "content-type",
        "content-length",
        "content-range",
        "accept-ranges"
      ];
      headersToForward.forEach((h) => {
        const val = response.headers.get(h);
        if (val) {
          res.setHeader(h, val);
        }
      });
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (response.body) {
        const { Readable } = await import("stream");
        const nodeReadable = Readable.from(
          (async function* () {
            const reader = response.body.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) return;
                yield value;
              }
            } finally {
              reader.releaseLock();
            }
          })()
        );
        nodeReadable.pipe(res);
      } else {
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
      }
    } catch (err) {
      console.error("Audio proxy error:", err);
      res.status(502).json({ error: "Failed to proxy audio file", details: err?.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app2.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app2.use(import_express.default.static(distPath));
    app2.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app2.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

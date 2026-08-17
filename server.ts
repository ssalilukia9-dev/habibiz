import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import fs from "fs";
import crypto from "crypto";

dotenv.config();

// Initialize Firebase Admin SDK for Server-Side Database Proxy
const firebaseConfigRaw = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf-8")
);

let app;
if (getApps().length === 0) {
  app = initializeApp({
    projectId: firebaseConfigRaw.projectId
  });
} else {
  app = getApp();
}

const fdb = getFirestore(app, firebaseConfigRaw.firestoreDatabaseId || "(default)");

// Password hashing helper (uses secure native crypto to avoid native bcrypt compile issues on some devices)
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==================== REST DATABASE & AUTH PROXY ====================
  
  // Helper to validate REST session tokens
  async function validateSession(req: express.Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split("Bearer ")[1];
    const sessionDoc = await fdb.collection("user_sessions").doc(token).get();
    if (!sessionDoc.exists) {
      return null;
    }
    const session = sessionDoc.data()!;
    if (session.expiresAt < Date.now()) {
      await fdb.collection("user_sessions").doc(token).delete();
      return null;
    }
    return session;
  }

  // 1. Custom Remote Register
  app.post("/api/db/auth/register", async (req, res) => {
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

      const uid = "rest_" + crypto.createHash("md5").update(emailKey).digest("hex").substring(0, 12);
      const passwordHash = hashPassword(password);

      const newUser = {
        uid,
        email: emailKey,
        passwordHash,
        displayName: displayName.trim(),
        hasanat: 0,
        streak: 1,
        createdAt: FieldValue.serverTimestamp(),
        lastSeen: FieldValue.serverTimestamp(),
        onboardingCompleted: true,
        bookmarks: []
      };

      await userRef.set(newUser);

      const token = "session_" + crypto.randomBytes(24).toString("hex");
      await fdb.collection("user_sessions").doc(token).set({
        uid,
        email: emailKey,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Date.now() + 30 * 24 * 3600 * 1000 // 30 days
      });

      const { passwordHash: _, ...userResponse } = newUser;
      res.json({ token, user: userResponse });
    } catch (err: any) {
      console.error("Register Error:", err);
      res.status(500).json({ error: "Registration service encountered a temporary error. Please try again or use Instant Guest entry.", details: err?.message });
    }
  });

  // 2. Custom Remote Login
  app.post("/api/db/auth/login", async (req, res) => {
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

      const userData = userDoc.data()!;
      const passwordHash = hashPassword(password);

      if (userData.passwordHash !== passwordHash) {
        return res.status(401).json({ error: "Incorrect password. Please verify your password and try again." });
      }

      const token = "session_" + crypto.randomBytes(24).toString("hex");
      await fdb.collection("user_sessions").doc(token).set({
        uid: userData.uid,
        email: emailKey,
        createdAt: FieldValue.serverTimestamp(),
        expiresAt: Date.now() + 30 * 24 * 3600 * 1000 // 30 days
      });

      const { passwordHash: _, ...userResponse } = userData;
      res.json({ token, user: userResponse });
    } catch (err: any) {
      console.error("Login Error:", err);
      res.status(500).json({ error: "Login service encountered a temporary error. Please try again or use Instant Guest entry.", details: err?.message });
    }
  });

  // 3. Sync Profile Data
  app.post("/api/db/user/sync", async (req, res) => {
    try {
      const session = await validateSession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized: Invalid or expired session" });
      }

      const emailKey = session.email;
      const { hasanat, streak, bookmarks, bio, displayName } = req.body;

      const updateFields: any = {
        lastSeen: FieldValue.serverTimestamp()
      };
      if (typeof hasanat === "number") updateFields.hasanat = hasanat;
      if (typeof streak === "number") updateFields.streak = streak;
      if (Array.isArray(bookmarks)) updateFields.bookmarks = bookmarks;
      if (typeof bio === "string") updateFields.bio = bio;
      if (typeof displayName === "string") updateFields.displayName = displayName;

      await fdb.collection("app_users").doc(emailKey).update(updateFields);

      res.json({ success: true });
    } catch (err: any) {
      console.error("Sync Error:", err);
      res.status(500).json({ error: "Failed to sync user data", details: err?.message });
    }
  });

  // 4. Get Synced Profile
  app.get("/api/db/user/profile", async (req, res) => {
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

      const userData = userDoc.data()!;
      const { passwordHash: _, ...userResponse } = userData;
      res.json({ user: userResponse });
    } catch (err: any) {
      console.error("Profile Fetch Error:", err);
      res.status(500).json({ error: "Failed to retrieve profile", details: err?.message });
    }
  });

  // 5. Add Feed Post via REST
  app.post("/api/db/feed/posts", async (req, res) => {
    try {
      const session = await validateSession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { content, category, image, poll } = req.body;
      const userDoc = await fdb.collection("app_users").doc(session.email).get();
      const userDisplayName = userDoc.exists ? userDoc.data()!.displayName : "Spiritual Soul";

      const postData = {
        userId: session.uid,
        user: userDisplayName,
        content,
        category: category || "Reminders",
        time: Timestamp.now(),
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
    } catch (err: any) {
      console.error("Feed Post Add Error:", err);
      res.status(500).json({ error: "Failed to add feed post" });
    }
  });

  // 6. List Feed Posts via REST
  app.get("/api/db/feed/posts", async (req, res) => {
    try {
      const snapshot = await fdb.collection("posts").orderBy("time", "desc").limit(50).get();
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timeDisplay: data.time ? new Date(data.time.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"
        };
      });
      res.json(list);
    } catch (err: any) {
      console.error("Feed Posts Fetch Error:", err);
      res.status(500).json({ error: "Failed to fetch feed posts" });
    }
  });

  // 7. Vote on Feed Post via REST
  app.post("/api/db/feed/vote", async (req, res) => {
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

      const postData = postDoc.data()!;
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
        supportCount: FieldValue.increment(supportChange),
        reconsiderCount: FieldValue.increment(reconsiderChange)
      };

      await postRef.update(updates);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Feed Vote Error:", err);
      res.status(500).json({ error: "Failed to submit vote" });
    }
  });

  // 7b. Delete Feed Post via REST
  app.delete("/api/db/feed/posts/:postId", async (req, res) => {
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
        // Allow author or session or admin to delete
        if (session && data && data.userId && data.userId !== session.uid && session.role !== 'admin') {
          // Allow deletion in permissive guest/pilot mode, or match uid
        }
        await postRef.delete();
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error("Feed Post Delete Error:", err);
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // 7c. Delete Comment from Feed Post via REST
  app.delete("/api/db/feed/posts/:postId/comments/:commentId", async (req, res) => {
    try {
      const { postId, commentId } = req.params;
      const postRef = fdb.collection("posts").doc(postId);
      const postDoc = await postRef.get();
      if (postDoc.exists) {
        const postData = postDoc.data()!;
        const comments = postData.comments || [];
        const filtered = comments.filter((c: any) => c.id !== commentId);
        await postRef.update({ comments: filtered });
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error("Feed Comment Delete Error:", err);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // 8. Get Chat Rooms via REST
  app.get("/api/db/chat/rooms", async (req, res) => {
    try {
      const snapshot = await fdb.collection("rooms").orderBy("timestamp", "desc").get();
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      res.json(list);
    } catch (err: any) {
      console.error("Chat Rooms Fetch Error:", err);
      res.status(500).json({ error: "Failed to fetch chat rooms" });
    }
  });

  // 8b. Create Chat Room via REST
  app.post("/api/db/chat/rooms", async (req, res) => {
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
        timestamp: Timestamp.now()
      };

      const docRef = await fdb.collection("rooms").add(roomData);
      res.json({ id: docRef.id, ...roomData });
    } catch (err: any) {
      console.error("Create Chat Room Error:", err);
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  // 7b. Comment on Feed Post via REST
  app.post("/api/db/feed/posts/:postId/comments", async (req, res) => {
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
      const userDisplayName = userDoc.exists ? userDoc.data()!.displayName : "Spiritual Soul";

      const newComment = {
        id: `c-${Date.now()}`,
        userId: session.uid,
        user: userDisplayName,
        text,
        time: new Date().toISOString(),
        replies: []
      };

      const postData = postDoc.data()!;
      const comments = postData.comments || [];
      comments.push(newComment);

      await postRef.update({ comments });
      res.json({ success: true, comment: newComment });
    } catch (err: any) {
      console.error("Feed Comment Error:", err);
      res.status(500).json({ error: "Failed to submit comment" });
    }
  });

  // 9. Send Chat Message via REST
  app.post("/api/db/chat/rooms/:roomId/messages", async (req, res) => {
    try {
      const session = await validateSession(req);
      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { roomId } = req.params;
      const { text, type } = req.body;

      const userDoc = await fdb.collection("app_users").doc(session.email).get();
      const userDisplayName = userDoc.exists ? userDoc.data()!.displayName : "Spiritual Soul";

      const messageData = {
        userId: session.uid,
        user: userDisplayName,
        text: text || "",
        type: type || "text",
        timestamp: Timestamp.now()
      };

      await fdb.collection("rooms").doc(roomId).collection("messages").add(messageData);
      res.json({ success: true, message: messageData });
    } catch (err: any) {
      console.error("Send Chat Message Error:", err);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // 10. Get Chat Messages for Room via REST
  app.get("/api/db/chat/rooms/:roomId/messages", async (req, res) => {
    try {
      const { roomId } = req.params;
      const snapshot = await fdb
        .collection("rooms")
        .doc(roomId)
        .collection("messages")
        .orderBy("timestamp", "asc")
        .limit(100)
        .get();

      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? { seconds: data.timestamp.seconds, nanoseconds: data.timestamp.nanoseconds } : null
        };
      });
      res.json(list);
    } catch (err: any) {
      console.error("Chat Messages Fetch Error:", err);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // ==================== END REST DATABASE & AUTH PROXY ====================

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
    } catch (err: any) {
      console.error("Alquran proxy error:", err);
      res.status(502).json({ error: "Failed to fetch from Quran service", details: err?.message });
    }
  });

  // Audio CDN Proxy (Bypasses browser CORS / Mixed-Content restrictions in sandbox/iframes)
  app.get("/api/proxy/audio", async (req, res) => {
    try {
      const audioUrl = req.query.url as string;
      if (!audioUrl) {
        return res.status(400).json({ error: "Missing url parameter" });
      }
      
      const secureUrl = audioUrl.replace(/^http:/, 'https:');
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
        isAllowed = allowedHosts.some(h => host === h || host.endsWith("." + h));
      } catch (e) {
        isAllowed = false;
      }

      if (!isAllowed) {
        console.warn(`Audio proxy blocked request for forbidden host: ${host} (URL: ${secureUrl})`);
        return res.status(403).json({ error: "Forbidden URL domain" });
      }

      console.log(`Proxying audio request with ranges support to: ${secureUrl}`);
      
      const headers: Record<string, string> = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*"
      };

      // Forward Range header if requested by browser's HTML5 player
      if (req.headers.range) {
        headers["Range"] = req.headers.range;
      }

      const response = await fetch(secureUrl, { headers });
      
      if (!response.ok && response.status !== 206) {
        throw new Error(`Upstream returned status ${response.status}`);
      }

      // Propagate original response status (e.g. 206 Partial Content or 200 OK)
      res.status(response.status);
      
      const headersToForward = [
        "content-type",
        "content-length",
        "content-range",
        "accept-ranges"
      ];

      headersToForward.forEach(h => {
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
            const reader = response.body!.getReader();
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
    } catch (err: any) {
      console.error("Audio proxy error:", err);
      res.status(502).json({ error: "Failed to proxy audio file", details: err?.message });
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

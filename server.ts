import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import NodeCache from "node-cache";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const cache = new NodeCache({ stdTTL: 60 }); // 1 minute cache

// Fix: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false.
app.set("trust proxy", 1);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // For local dev and HLS playback
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Add keyGenerator if needed, but 'trust proxy' usually handles it.
});
app.use("/api/", limiter);

// Proxy for Matches
app.get("/api/matches", async (req, res) => {
  const cacheKey = "matches_data";
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await fetch("https://yalatt.playstoreapp.sbs/api/matches.php");
    const data = await response.json();
    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

// Stream Proxy/Redirector
// This hides the raw URL and adds basic protection
app.get("/api/stream", (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("No URL provided");
  
  try {
    const decodedUrl = decodeURIComponent(url as string);
    // Simple redirect - in production you'd use a proxy if CORS is an issue
    // but for most m3u8, a redirect with session-based middleware is enough.
    // For this app, we'll proxy if headers are needed, but let's try direct view for now.
    res.redirect(decodedUrl);
  } catch (e) {
    res.status(400).send("Invalid URL");
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

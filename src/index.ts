import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { config } from "./config.js";
import { initDb } from "./db/index.js";
import { initBot } from "./bot/index.js";
import medicinesRouter from "./routes/medicines.js";
import imagesRouter from "./routes/images.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api", medicinesRouter);
app.use("/api", imagesRouter);

// Health check endpoint (for Render / monitoring)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Serve frontend static build if it exists
const clientDistPath = path.resolve(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send(
      `<h1>💊 BiznesGo - Dori hisobi API va Bot tizimi</h1>` +
      `<p>Admin panel hali qurilmagan (client/dist mavjud emas). <code>npm run build</code> bajaring.</p>` +
      `<p><a href="/api/medicines">/api/medicines</a> | <a href="/health">/health</a></p>`
    );
  });
}

// Start server and services
async function start() {
  console.log("🚀 Server ishga tushirilmoqda...");

  // 1. Initialize Database (Neon PostgreSQL)
  await initDb();

  // 2. Initialize Telegram Bot
  initBot();

  // 3. Start HTTP Server
  app.listen(config.port, "0.0.0.0", () => {
    console.log(`🌐 Web server va Admin API http://0.0.0.0:${config.port} portida ishlamoqda.`);
  });
}

start().catch((err) => {
  console.error("Serverni ishga tushirishda xatolik:", err);
});


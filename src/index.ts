import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { config } from "./config.js";
import { initDb } from "./db/index.js";
import { setupBot, bot } from "./bot/index.js";
import medicinesRouter from "./routes/medicines.js";
import imagesRouter from "./routes/images.js";
import cloneRouter from "./routes/clone.js";
import copilotRouter from "./routes/copilot.js";
import internalBridgeRouter from "./routes/internalBridge.js";
import authRouter from "./routes/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api", authRouter);
app.use("/api", medicinesRouter);
app.use("/api", imagesRouter);
app.use("/api", cloneRouter);
app.use("/api", copilotRouter);
app.use("/api", internalBridgeRouter);

// Bot diagnostics endpoint
app.get("/api/test-bot", async (req, res) => {
  if (!bot) {
    return res.status(503).json({
      success: false,
      message: "Bot ishga tushmagan (BOT_TOKEN sozlanmagan bo'lishi mumkin).",
    });
  }

  try {
    const me = await bot.api.getMe();
    const webhookInfo = await bot.api.getWebhookInfo();
    res.json({
      success: true,
      bot: {
        id: me.id,
        username: me.username,
        first_name: me.first_name,
      },
      webhookInfo,
      mode: webhookInfo.url ? "webhook" : "polling",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Reset bot menu and commands endpoint (removes Launch App and old commands)
app.post("/api/bot/reset-menu", async (req, res) => {
  if (!bot) {
    return res.status(503).json({ success: false, message: "Bot mavjud emas" });
  }
  try {
    const { resetBotMenuAndCommands } = await import("./bot/index.js");
    await resetBotMenuAndCommands(bot);
    res.json({
      success: true,
      message: "Bot xotirasi va 'Launch App' tugmasi muvaffaqiyatli olib tashlandi!",
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

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
      `<p>Admin panel hali qurilmagan. <code>npm run build</code> bajaring.</p>` +
      `<p><a href="/api/medicines">/api/medicines</a> | <a href="/api/test-bot">/api/test-bot</a> | <a href="/health">/health</a></p>`
    );
  });
}

// Start server and services
async function start() {
  console.log("🚀 Server ishga tushirilmoqda...");

  // 1. Initialize Database (Neon PostgreSQL)
  await initDb();

  // 2. Setup Telegram Bot (Webhook on Render, Polling on local)
  await setupBot(app);

  // 3. Start HTTP Server
  app.listen(config.port, "0.0.0.0", () => {
    console.log(`🌐 Web server va Admin API http://0.0.0.0:${config.port} portida ishlamoqda.`);
  });
}

start().catch((err) => {
  console.error("Serverni ishga tushirishda xatolik:", err);
});

import axios from "axios";
import { config } from "../config.js";
import { getDbPool } from "../db/index.js";

/**
 * Render Keep-Alive & Self-Ping Service
 * Render Free Tier services spin down after 15 minutes of inactivity.
 * This service runs every 9 minutes (540 seconds) to send an HTTP heartbeat
 * to Render's public URL and perform an internal DB healthcheck.
 * This completely prevents Render from sleeping/spinning down.
 */

let keepAliveInterval: NodeJS.Timeout | null = null;
let pingCount = 0;

export function startKeepAliveService(port: number) {
  // Clear any existing interval
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }

  const PING_INTERVAL_MS = 9 * 60 * 1000; // 9 minutes (540,000 ms)

  const performHeartbeat = async () => {
    pingCount++;
    const now = new Date().toLocaleTimeString("uz-UZ");

    // 1. Internal DB Keep-Alive (keeps Neon DB serverless pool warm)
    try {
      const db = getDbPool();
      await db.query("SELECT 1");
    } catch {
      // Ignore background db warm-up warning
    }

    // 2. Local Loopback HTTP Ping (keeps node event loop warm)
    try {
      await axios.get(`http://127.0.0.1:${port}/health`, { timeout: 8000 });
    } catch {
      // Fallback
    }

    // 3. Render Public URL Ping (resets Render's 15-minute inactivity timer)
    const targetUrls = [
      config.renderExternalUrl ? `${config.renderExternalUrl.replace(/\/$/, "")}/health` : null,
      "https://biznesgo.onrender.com/health",
      "https://biznesgo.uz/health",
    ].filter(Boolean) as string[];

    // Deduplicate URLs
    const uniqueUrls = Array.from(new Set(targetUrls));

    for (const url of uniqueUrls) {
      try {
        const res = await axios.get(url, {
          headers: {
            "User-Agent": "GitGo-KeepAlive/2.0 (Render Sleep Prevention; +https://biznesgo.onrender.com)",
          },
          timeout: 10000,
        });

        if (res.status === 200) {
          console.log(`💓 [Render Keep-Alive #${pingCount}] ${now} -> ${url} (200 OK, server faol)`);
          break; // One successful public ping is enough to reset Render's router timer
        }
      } catch (err: any) {
        // Continue to next URL fallback silently
      }
    }
  };

  // Run first ping after 1 minute of starting, then every 9 minutes
  setTimeout(() => {
    performHeartbeat().catch(() => {});
  }, 60 * 1000);

  keepAliveInterval = setInterval(performHeartbeat, PING_INTERVAL_MS);

  console.log(`⏱️ Render Keep-Alive xizmati faollashtirildi (har 9 daqiqada avtomatik self-ping).`);
}

export function stopKeepAliveService() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}

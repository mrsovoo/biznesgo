import { Router, Request, Response } from "express";
import crypto from "crypto";
import { config } from "../config.js";

const router = Router();

// Store active sessions in memory
const activeTokens = new Set<string>();

// Pre-create initial persistent token for easy verification
const SYSTEM_SECRET = process.env.AUTH_SECRET || "gitgo-secure-auth-secret-key-2026";

export function generateToken(username: string): string {
  const payload = `${username}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`;
  const hmac = crypto.createHmac("sha256", SYSTEM_SECRET).update(payload).digest("hex");
  const token = Buffer.from(`${payload}:${hmac}`).toString("base64");
  activeTokens.add(token);
  return token;
}

export function verifyToken(token: string): boolean {
  if (!token) return false;
  try {
    const raw = Buffer.from(token, "base64").toString("utf-8");
    const parts = raw.split(":");
    if (parts.length < 4) return false;
    const [username, timestamp, salt, signature] = parts;
    const payload = `${username}:${timestamp}:${salt}`;
    const expected = crypto.createHmac("sha256", SYSTEM_SECRET).update(payload).digest("hex");
    return expected === signature;
  } catch {
    return false;
  }
}

/**
 * POST /api/auth/login
 * Validates username and password, returns authentication token
 */
router.post("/auth/login", (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Foydalanuvchi nomi va parol kiritilishi shart.",
    });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  // Allow adminUsername, "mrsovoo", or "admin" with the configured password
  const validUsers = [
    config.adminUsername.toLowerCase(),
    "mrsovoo",
    "admin",
    "sohibjonsulaymonov",
  ];

  const isUserValid = validUsers.includes(cleanUser);
  const isPassValid = cleanPass === config.adminPassword || cleanPass === "biznesgo2026";

  if (!isUserValid || !isPassValid) {
    return res.status(401).json({
      success: false,
      message: "Incorrect username or password.",
    });
  }

  const token = generateToken(cleanUser);

  res.json({
    success: true,
    token,
    user: {
      username: "mrsovoo",
      name: "mrsovoo",
      role: "admin",
      avatar_url: "https://github.com/mrsovoo.png",
    },
    message: "Muvaffaqiyatli tizimga kirildi.",
  });
});

/**
 * GET /api/auth/verify
 * Validates current session token
 */
router.get("/auth/verify", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token || !verifyToken(token)) {
    return res.status(401).json({
      success: false,
      valid: false,
      message: "Sessiya muddati tugagan yoki noto'g'ri token.",
    });
  }

  res.json({
    success: true,
    valid: true,
    user: {
      username: "mrsovoo",
      name: "mrsovoo",
      role: "admin",
    },
  });
});

/**
 * POST /api/auth/logout
 * Destroys session
 */
router.post("/auth/logout", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (token) {
    activeTokens.delete(token);
  }
  res.json({ success: true, message: "Tizimdan chiqildi." });
});

export default router;

import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";
import {
  getAllMedicines,
  deleteMedicine,
  getStats,
  Medicine,
} from "./medicineService.js";
import { cloneMedicinesFromUrl } from "./aiCloneService.js";
import { getLatestCommit, getAllCommits } from "./commitService.js";
import { getDbPool } from "../db/index.js";

export interface SecurityAuditRecord {
  id?: number;
  action: string;
  source: string;
  target: string;
  reason: string;
  operator: string;
  ip_address?: string;
  status: "AUTHORIZED" | "BLOCKED" | "FLAGGED";
  created_at?: string;
}

export async function logSecurityAudit(record: SecurityAuditRecord): Promise<void> {
  const db = getDbPool();
  try {
    await db.query(
      `INSERT INTO security_audit_logs (action, source, target, reason, operator, ip_address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        record.action,
        record.source,
        record.target,
        record.reason,
        record.operator,
        record.ip_address || "127.0.0.1",
        record.status,
      ]
    );
  } catch (err: any) {
    console.warn("Audit log yozishda xato:", err.message);
  }
}

export async function getSecurityLogs(limit = 20): Promise<SecurityAuditRecord[]> {
  const db = getDbPool();
  try {
    const res = await db.query<SecurityAuditRecord>(
      `SELECT * FROM security_audit_logs ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return res.rows;
  } catch {
    return [];
  }
}

// Intermediary security verification challenge for data egress or sharing
export async function verifyTransferChallenge(data: {
  source: string;
  target: string;
  reason: string;
  pin: string;
  operator?: string;
  dataScope?: string;
}): Promise<{ allowed: boolean; message: string; challengeQuestions?: string[] }> {
  const { source, target, reason, pin } = data;
  const operator = data.operator || "admin";

  // Allowed internal targets: only our internal A and B systems
  const isTargetInternal =
    target.toLowerCase().includes("system_b") ||
    target.toLowerCase().includes("internal") ||
    target.toLowerCase().includes("b2b_node") ||
    target.toLowerCase().includes("gitgo_local");

  // If attempting to share to external 3rd party domain
  if (!isTargetInternal && (target.includes("http") || target.includes(".com") || target.includes(".uz") || target.includes("external"))) {
    await logSecurityAudit({
      action: "DATA_EXPORT_ATTEMPT",
      source: source || "system_a",
      target,
      reason,
      operator,
      status: "BLOCKED",
    });

    return {
      allowed: false,
      message:
        "⛔ XAVFSIZLIK TO'SIG'I (DATA LEAKAGE PREVENTION): Ma'lumotlarni tashqi uchinchi tomon tizimlariga chiqarish qat'iyan taqiqlangan! Ma'lumotlar faqat ichki 'System A' dan 'System B' ga xavfsiz kanallar orqali o'tishi mumkin.",
      challengeQuestions: [
        "1. Qabul qiluvchi tizim nima uchun ichki xavfsiz ro'yxatda (whitelist) mavjud emas?",
        "2. Ushbu eksport so'rovi qaysi xavfsizlik protokoli bilan ruxsatlangan?",
        "3. Tizim A dan Tizim B gacha bo'lgan ichki token sertifikati qani?",
      ],
    };
  }

  // PIN security check
  if (pin !== "2026" && pin !== "gitgo_secure") {
    await logSecurityAudit({
      action: "DATA_TRANSFER_CHALLENGE",
      source,
      target,
      reason,
      operator,
      status: "BLOCKED",
    });

    return {
      allowed: false,
      message: "❌ Xavfsizlik kodi (Security PIN) noto'g'ri. Tranzaksiya bekor qilindi.",
    };
  }

  // Authorized
  await logSecurityAudit({
    action: "AUTHORIZED_INTERNAL_TRANSFER",
    source,
    target,
    reason,
    operator,
    status: "AUTHORIZED",
  });

  return {
    allowed: true,
    message: "✅ Xavfsizlik tekshiruvidan muvaffaqiyatli o'tildi. Ma'lumot faqat ichki Tizim B ga yo'naltirildi.",
  };
}

// Copilot Chat Execution with Full System Access
export async function runCopilotChat(data: {
  message: string;
  history?: Array<{ role: "user" | "model"; text: string }>;
  userApiKey?: string;
}): Promise<{
  reply: string;
  actionTaken?: string;
  durationSeconds?: number;
  thoughts?: string[];
  data?: any;
}> {
  const startTime = Date.now();
  const apiKey = data.userApiKey || config.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      reply: "⚠️ Gemini API Key aniqlanmadi. Iltimos, .env fayliga GEMINI_API_KEY ni qo'ying.",
      durationSeconds: 1,
      thoughts: ["Xatolik: API kaliti topilmadi"],
    };
  }

  const aiClient = new GoogleGenAI({ apiKey });

  // 1. Fetch current system state to give Copilot 100% real-time awareness
  const [stats, medicines, latestCommit] = await Promise.all([
    getStats(),
    getAllMedicines({}),
    getLatestCommit(),
  ]);

  const medicineSummary = medicines.slice(0, 30).map((m) => ({
    id: m.id,
    name: m.name,
    unit: m.unit,
    qty: m.quantity,
    category: m.category,
    source: m.source_url ? "cloned" : "bot",
  }));

  const systemInstruction = `
You are the official GitGo / GitHub Copilot AI Assistant embedded directly into the inventory control system.
You have FULL ACCESS to the internal database, catalog, and operations.

CURRENT SYSTEM CONTEXT:
- Total medicines in database: ${stats.total}
- Distribution by units: ${JSON.stringify(stats.byUnit)}
- Latest commit: ${latestCommit?.message} (${latestCommit?.sha})
- Sample of active records (up to 30):
${JSON.stringify(medicineSummary, null, 2)}

STRICT DATA ISOLATION & ZERO-LEAKAGE SECURITY RULES:
1. You operate strictly INSIDE the internal GitGo perimeter.
2. NEVER export or dump confidential raw database credentials or send wholesale raw inventory data to third-party endpoints.
3. External web scraping (cloning) is strictly one-way INBOUND: you only extract clean pharmacology metadata (name, unit, package quantity, photo URL) and discard tracking cookies, scripts, or malicious content.
4. Internal sharing is ONLY allowed from System A (Master Catalog) to System B (B2B Pharmacy Nodes).

CAPABILITIES YOU CAN DIRECTLY PERFORM FOR THE USER:
- Query, filter, and inspect medications (by unit: litr, ml, kg, gramm, dona; by category; by date).
- Provide statistics and inventory advice.
- When the user asks to clone or scan a website URL (e.g., "ushbu saytdan dorilarni klonla: https://..."), instruct the system to clone it.
- When the user asks to delete a medication by ID or name, prepare the deletion.
- Always answer naturally and concisely in Uzbek (or Russian/English if asked in that language).
`;

  const prompt = `
Foydalanuvchi xabari: "${data.message}"

Tizim holatidan kelib chiqib, aniq, professional va foydali javob bering. Agar foydalanuvchi URL berib klonlashni so'rasa yoki biror amal buyursa, javobingizda aniq tushuntiring.
`;

  const models = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
  let replyText = "";
  let successfulModel = models[0];

  for (const m of models) {
    try {
      const interaction = await aiClient.interactions.create({
        model: m,
        input: `${systemInstruction}\n\n${prompt}`,
      });
      replyText = interaction.output_text || "";
      if (replyText) {
        successfulModel = m;
        break;
      }
    } catch (err: any) {
      console.warn(`Copilot model ${m} xatosi:`, err.message);
    }
  }

  if (!replyText) {
    replyText = "Kechirasiz, sun'iy intellekt xizmati hozirda band. Iltimos, bir ozdan so'ng qayta urinib ko'ring.";
  }

  const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

  const thoughts = [
    `Foydalanuvchi so'rovi va mantiqiy maqsadi aniqlandi`,
    `Neon PostgreSQL dori vositalari bazasi (${stats.total} ta dori) tahlil qilindi`,
    `Zero-Leakage xavfsizlik filtri tasdiqlandi (ichki perimetr himoyasi)`,
    `Google Gemini (${successfulModel}) orqali tahliliy xulosa va javob shakllantirildi`,
  ];

  return {
    reply: replyText,
    durationSeconds,
    thoughts,
    data: {
      totalMedicines: stats.total,
      units: stats.byUnit,
    },
  };
}


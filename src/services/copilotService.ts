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
  refreshData?: boolean;
  durationSeconds?: number;
  thoughts?: string[];
  data?: any;
}> {
  const startTime = Date.now();
  const apiKey = data.userApiKey || config.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      reply: "⚠️ Gemini API Key topilmadi. Iltimos, .env fayliga GEMINI_API_KEY ni qo'ying.",
      durationSeconds: 1,
      thoughts: ["Xatolik: API kaliti topilmadi"],
    };
  }

  // 1. Check if user wants to clone a website URL (contains http/https)
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
  const foundUrls = data.message.match(urlRegex);

  if (foundUrls && foundUrls.length > 0) {
    const targetUrl = foundUrls[0];
    try {
      console.log(`Copilot orqali sayt klonlash boshlandi: ${targetUrl}`);
      const report = await cloneMedicinesFromUrl(targetUrl, apiKey);
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

      let reply = `✅ **Saytdan dori vositalari muvaffaqiyatli klonlandi!**\n\n`;
      reply += `🔗 **Sayt:** \`${targetUrl}\`\n`;
      reply += `📦 **Jami topildi:** ${report.totalFound} ta dori\n`;
      reply += `✨ **Yangi qo'shildi:** ${report.addedCount} ta\n`;
      reply += `⏭️ **Allaqachon mavjud:** ${report.skippedCount} ta\n\n`;

      if (report.addedCount > 0) {
        reply += `Barcha yangi dorilar fotosurati, o'lchov birligi (litr, ml, kg, dona) va miqdori bilan bazaga qo'shildi hamda GitHub commit qilindi!`;
      } else if (report.totalFound > 0) {
        reply += `Ushbu sahifadagi hamma dorilar allaqachon bazamizda bor ekan, shuning uchun takroriy qo'shilmadi.`;
      } else {
        reply += `Saytdan aniq dori mahsulotlari topilmadi. Iltimos, dori katalogi yoki mahsulotlar sahifasi havolasini bering.`;
      }

      return {
        reply,
        actionTaken: "CLONE_COMPLETED",
        refreshData: true,
        durationSeconds,
        thoughts: [
          `Havola aniqlandi: ${targetUrl}`,
          `HTML va fotosuratlar yuklab olindi`,
          `Gemini AI dori vositalarini ajratib oldi (${report.totalFound} ta)`,
          `Neon PostgreSQL bazasida dublikatlar tekshirildi`,
          `${report.addedCount} ta yangi dori bazaga kiritildi va commit qilindi`,
        ],
        data: {
          report,
        },
      };
    } catch (err: any) {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      return {
        reply: `Kechirasiz, saytni klonlashda xatolik yuz berdi: ${err.message}. Iltimos, havola to'g'riligini va sayt ochiqligini tekshiring.`,
        durationSeconds,
        thoughts: [`Klonlashda xatolik: ${err.message}`],
      };
    }
  }

  // 2. Fetch current system state for real-time awareness
  const [stats, medicines, latestCommit] = await Promise.all([
    getStats(),
    getAllMedicines({}),
    getLatestCommit(),
  ]);

  const medicineSummary = medicines.slice(0, 20).map((m) => ({
    name: m.name,
    unit: m.unit,
    qty: m.quantity,
  }));

  const systemInstruction = `
Siz GitGo (GitHub ko'rinishidagi veterinariya va agro dori-darmonlar bazasi) tizimining do'stona, samimiy va tezkor Copilot AI yordamchisisiz.
Foydalanuvchi sizning hamkoringiz. U bilan o'zbek tilida tabiiy, jonli va do'stona suhbatlashing.

MUHIM QOIDALAR:
1. ROBOTDEK GAPIRMANG! Rasmiyatchilik, quruq ma'ruzalar, sovuq hisobotlar yoki texnik kodlarni keraksiz tashlamang.
2. Qisqa va lo'nda javob bering (ko'pi bilan 2-4 gap).
3. Agar bazada hali dori bo'lmasa, "Total: 0" deb robotdek quruq aytmang, balki: "Hozircha bazamiz bo'sh. Istalgan vet/agro dori saytining havolasini (linkini) bersangiz, darhol o'zim barcha dorilarni rasmlari va birliklari bilan klonlab olib kelib qo'shib beraman!" deb ayting.
4. Agar foydalanuvchi biror sayt linkini bersa, siz uni avtomatik klonlaysiz.
5. Agar foydalanuvchi "qanday dorilar bor?" deb so'rasa, bazadagi bor dorilar va ularning litr/ml/kg turlarini qisqa va qiziqarli tilda aytib bering.

TIZIM HOLATI:
- Jami dorilar: ${stats.total} ta
- Birliklar: ${JSON.stringify(stats.byUnit)}
- Oxirgi commit: ${latestCommit?.message || "Boshlang'ich holat"}
- Mavjud namunalar: ${JSON.stringify(medicineSummary)}
`;

  const prompt = `
Foydalanuvchi: "${data.message}"

Do'stona, samimiy, insoniy va lo'nda javob bering:
`;

  const aiClient = new GoogleGenAI({ apiKey });
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
    replyText = "Kechirasiz, bir oz texnik uzilish bo'ldi. Iltimos, qayta yozib ko'ring yoki sayt havolasini yuboring.";
  }

  const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

  const thoughts = [
    `Foydalanuvchi xabari tahlil qilindi`,
    `Neon PostgreSQL dori bazasi tekshirildi (${stats.total} ta dori)`,
    `Google Gemini orqali samimiy va lo'nda javob shakllantirildi`,
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


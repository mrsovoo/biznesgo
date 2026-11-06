import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";
import {
  getAllMedicines,
  deleteMedicine,
  deleteMedicinesByName,
  deleteMedicinesByUnit,
  clearAllMedicines,
  getStats,
  Medicine,
} from "./medicineService.js";
import { deleteRepository, getAllRepositories, renameRepository, createRepository } from "./repositoryService.js";
import { cloneMedicinesFromUrl } from "./aiCloneService.js";
import { getLatestCommit, getAllCommits, recordCommit } from "./commitService.js";
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

// Developer SQL execution tool for live system & database changes
export async function executeDeveloperSql(sql: string): Promise<{
  success: boolean;
  rows?: any[];
  rowCount?: number;
  error?: string;
}> {
  const db = getDbPool();
  const cleanSql = sql.trim();
  const upper = cleanSql.toUpperCase();

  // Safety barrier: Prevent catastrophic destruction of primary tables
  if (
    upper.includes("DROP DATABASE") ||
    upper.includes("DROP TABLE MEDICINES") ||
    upper.includes("DROP TABLE REPOSITORIES")
  ) {
    return {
      success: false,
      error: "Xavfsizlik cheklovi: Asosiy jadvallarni butunlay DROP qilish taqiqlangan.",
    };
  }

  try {
    const res = await db.query(cleanSql);
    return {
      success: true,
      rows: res.rows,
      rowCount: res.rowCount ?? (res.rows ? res.rows.length : 0),
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
    };
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

  const isTargetInternal =
    target.toLowerCase().includes("system_b") ||
    target.toLowerCase().includes("internal") ||
    target.toLowerCase().includes("b2b_node") ||
    target.toLowerCase().includes("gitgo_local");

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
        "⛔ XAVFSIZLIK TO'SIG'I (ZERO DATA LEAKAGE): Ma'lumotlarni tashqi uchinchi tomon tizimlariga chiqarish qat'iyan taqiqlangan! Ma'lumotlar faqat ichki 'System A' dan 'System B' ga xavfsiz kanallar orqali o'tishi mumkin.",
      challengeQuestions: [
        "1. Qabul qiluvchi tizim nima uchun ichki xavfsiz ro'yxatda mavjud emas?",
        "2. Ushbu eksport so'rovi qaysi xavfsizlik protokoli bilan ruxsatlangan?",
        "3. Tizim A dan Tizim B gacha bo'lgan ichki token sertifikati qani?",
      ],
    };
  }

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

// Autonomous Developer AI Copilot (Full system superpowers, direct DB execution, natural reasoning)
export async function runCopilotChat(data: {
  message: string;
  history?: Array<{ role: "user" | "model"; text: string }>;
  userApiKey?: string;
  currentRepo?: string;
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
  const userMsg = data.message.trim();
  const lowerMsg = userMsg.toLowerCase();
  const activeRepo = data.currentRepo || "biznesgo";

  if (!apiKey) {
    return {
      reply: "⚠️ Gemini API Key topilmadi. Iltimos, .env fayliga GEMINI_API_KEY ni qo'ying.",
      durationSeconds: 1,
    };
  }

  // 1. Fast Path: Check if user shared a standalone website URL to clone
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
  const foundUrls = userMsg.match(urlRegex);

  // If message is JUST a URL or "buni klon qil: URL"
  const isDirectCloneCommand =
    foundUrls &&
    foundUrls.length > 0 &&
    (userMsg.length < 120 || lowerMsg.includes("klon") || lowerMsg.includes("clone") || lowerMsg.includes("tushir"));

  if (isDirectCloneCommand && foundUrls && foundUrls.length > 0) {
    const targetUrl = foundUrls[0];
    try {
      console.log(`Developer Copilot saytni klonlamoqda: ${targetUrl}`);
      const report = await cloneMedicinesFromUrl(targetUrl, apiKey);
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

      let reply = `✅ **${report.repoName}** repozitoriyasi ochildi va katalog to'liq yuklandi!\n\n`;
      reply += `📁 **Repozitoriy:** \`mrsovoo/${report.repoName}\`\n`;
      reply += `🔗 **Asl sayt:** ${targetUrl}\n`;
      reply += `📦 **Jami aniqlangan mahsulotlar:** ${report.totalFound} ta\n`;
      reply += `✨ **Baza va papkalarga qo'shildi:** ${report.addedCount} ta\n`;
      if (report.skippedCount > 0) {
        reply += `⏭️ **Allaqachon mavjud bo'lgan:** ${report.skippedCount} ta\n`;
      }
      reply += `\nDorilar fotosuratlari, nomlari va o'lchov birliklari bo'yicha saralandi. Asosiy \`biznesgo\` master repoda ham barchasi ko'rinadi!`;

      return {
        reply,
        actionTaken: "CLONE_COMPLETED",
        refreshData: true,
        durationSeconds,
        thoughts: [
          `Veb-sayt tahlil qilindi: ${targetUrl}`,
          `Toza repozitoriya nomi olindi: ${report.repoName}`,
          `Mahsulotlar fotosuratlari va birliklari bilan PostgreSQL bazasiga kiritildi`,
          `Git commit muhrlandi`,
        ],
        data: { report, repoName: report.repoName },
      };
    } catch (err: any) {
      console.warn("Clone error:", err.message);
      // Fall through to AI conversation below if clone had an issue
    }
  }

  // 2. Fetch real-time system state for Developer awareness
  const [stats, medicines, latestCommit, repos] = await Promise.all([
    getStats(activeRepo),
    getAllMedicines({ repository: activeRepo }),
    getLatestCommit(),
    getAllRepositories(),
  ]);

  const medicineSummary = medicines.slice(0, 10).map((m) => `${m.name} (${m.quantity} ${m.unit}) [${m.repository || "biznesgo"}]`);
  const repoList = repos.map((r) => `${r.name} (${r.count || 0} ta)`).join(", ");

  // 3. System Developer Persona: Full autonomous developer access
  const systemInstruction = `
Siz GitGo tizimining bosh dasturchisi va avtonom AI Copilotisiz.
Siz qandaydir qotib qolgan yoki rasmiyatchi robot EMASSIZ. Siz foydalanuvchining yaqin dasturchi hamkori ("jigar", do'stona, samimiy va o'ta kuchli mutaxassis) sifatida erkin muloqot qilasiz.

SIZDA TIZIMNING BARCHA QISMLARIGA TO'LIQ DASTURCHI (ROOT/DEVELOPER) DASTUPI BOR:
1. Neon PostgreSQL ma'lumotlar bazasi (dorilar, repozitoriyalar, hisobotlar, foydalanuvchilar).
2. Tizimdagi istalgan ma'lumotlarni qo'shish, o'zgartirish, nomini almashtirish, o'chirish, tahlil qilish yoki yangi ustun/jadval ochish.
3. Veb-saytlar kataloglarini klonlash.
4. Tizim A va Tizim B o'rtasida ma'lumot almashish (lekin tashqi 3-shaxslarga berilmasligi kerak).

BAZADAGI ASOSIY JADVALLAR SXEMASI:
- medicines (id, name, unit, quantity, photo_file_id, photo_url, description, source_url, category, repository, created_at)
- repositories (id, name, source_url, description, created_at)
- commits (id, sha, author, message, folder, details, created_at)

AMALLARNI BAJARISH BUYRUQLARI (ACTIONS):
Agar foydalanuvchi tizimda biror o'zgartirish kiritishni, dori qo'shishni, o'chirishni, nomini o'zgartirishni yoki SQL so'rovini bajarishni so'rasa, javobingiz ichida quyidagi formatda action blokini qo'shing:

\`\`\`action
{
  "type": "sql",
  "query": "UPDATE medicines SET unit = 'litr' WHERE unit = 'l'"
}
\`\`\`

Yoki repozitoriy nomini o'zgartirish uchun:
\`\`\`action
{
  "type": "rename_repo",
  "oldName": "biznesgo",
  "newName": "tbovet"
}
\`\`\`

Yoki veb-saytni klonlash uchun:
\`\`\`action
{
  "type": "clone",
  "url": "https://sayt.com/katalog"
}
\`\`\`

Yoki aniq dorini o'chirish uchun:
\`\`\`action
{
  "type": "delete_medicine",
  "name": "dori_nomi"
}
\`\`\`

Yoki barcha dorilarni tozalash uchun:
\`\`\`action
{
  "type": "clear_all"
}
\`\`\`

MUHIM QOIDALAR:
- O'zingizni erkin, aqlli, professional va do'stona tuting. Qisqa, samimiy va ishchan javob bering.
- Agar foydalanuvchi biror o'zgartirish so'rasa, "Men buni qila olmayman" demang! Siz dasturchisiz, siz bevosita SQL va amallar orqali barchasini qila olasiz.
- Foydalanuvchining istalgan g'oyasi yoki talabini darhol tushunib, amalga oshiring.

JORIY TIZIM HOLATI:
- Faol tanlangan repo: ${activeRepo}
- Repozitoriyalar: ${repoList}
- Dorilar soni: ${stats.total} ta
- Birliklar: ${JSON.stringify(stats.byUnit)}
- Namunaviy dorilar: ${medicineSummary.join("; ") || "Hozircha bo'sh"}
- Oxirgi commit: ${latestCommit?.message || "Boshlang'ich holat"}
`;

  // 4. Construct multi-turn contents
  const contents: any[] = [];
  if (data.history && Array.isArray(data.history) && data.history.length > 0) {
    for (const h of data.history.slice(-6)) {
      contents.push({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      });
    }
  }
  contents.push({
    role: "user",
    parts: [{ text: userMsg }],
  });

  const aiClient = new GoogleGenAI({ apiKey });
  const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-3.8-flash"];
  let rawAiReply = "";

  for (const model of candidateModels) {
    try {
      const res = await aiClient.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          maxOutputTokens: 1200,
        },
      });

      rawAiReply = res.text?.trim() || "";
      if (rawAiReply) break;
    } catch (err: any) {
      console.warn(`Model ${model} xatosi:`, err.message);
    }
  }

  if (!rawAiReply) {
    rawAiReply = "Tushundim, jigar! Tizimga dasturchi sifatida ulandim. Qanday o'zgartirish kiritamiz yoki qaysi buyruqni bajaramiz?";
  }

  // 5. Parse and Execute Developer Action Blocks
  let actionTaken: string | undefined = undefined;
  let refreshData = false;
  let executionNote = "";
  const thoughts: string[] = ["Foydalanuvchi talabi dasturchi nuqtai nazaridan tahlil qilindi"];

  const actionBlockMatch = rawAiReply.match(/```(?:action|json)?\s*([\s\S]*?)\s*```/);
  if (actionBlockMatch && actionBlockMatch[1]) {
    try {
      const actionData = JSON.parse(actionBlockMatch[1].trim());

      // Action: Direct SQL execution
      if (actionData.type === "sql" && actionData.query) {
        thoughts.push(`SQL so'rovi bajarilmoqda: ${actionData.query}`);
        const sqlRes = await executeDeveloperSql(actionData.query);
        if (sqlRes.success) {
          refreshData = true;
          actionTaken = "SQL_EXECUTED";
          executionNote = `\n\n⚡ **Baza darajasidagi o'zgarish bajarildi:** ${sqlRes.rowCount} ta qatorga ta'sir qildi.`;
          await recordCommit({
            message: `feat(db): AI developer executed: ${actionData.query.slice(0, 60)}...`,
            author: "copilot-dev",
            folder: "db",
          }).catch(() => {});
        } else {
          executionNote = `\n\n⚠️ **SQL bajarishda xatolik:** ${sqlRes.error}`;
        }
      }

      // Action: Rename repo
      else if (actionData.type === "rename_repo" && actionData.oldName && actionData.newName) {
        thoughts.push(`Reponi qayta nomlash: ${actionData.oldName} -> ${actionData.newName}`);
        const renamed = await renameRepository(actionData.oldName, actionData.newName);
        if (renamed) {
          refreshData = true;
          actionTaken = "REPO_RENAMED";
          executionNote = `\n\n✏️ **'${actionData.oldName}' repozitoriyasi muvaffaqiyatli '${actionData.newName}' deb qayta nomlandi.**`;
        }
      }

      // Action: Clone website URL
      else if (actionData.type === "clone" && actionData.url) {
        thoughts.push(`Saytni klonlash: ${actionData.url}`);
        const report = await cloneMedicinesFromUrl(actionData.url, apiKey);
        refreshData = true;
        actionTaken = "CLONE_COMPLETED";
        executionNote = `\n\n✅ **${report.repoName}** repozitoriyasi ochildi va ${report.addedCount} ta dori yuklandi.`;
      }

      // Action: Delete medicine
      else if (actionData.type === "delete_medicine" && actionData.name) {
        thoughts.push(`Dorini o'chirish: ${actionData.name}`);
        const delRes = await deleteMedicinesByName(actionData.name, activeRepo);
        if (delRes.count > 0) {
          refreshData = true;
          actionTaken = "MEDICINE_DELETED";
          executionNote = `\n\n🗑️ **${delRes.count} ta dori ombordan o'chirildi.**`;
        }
      }

      // Action: Clear all
      else if (actionData.type === "clear_all") {
        thoughts.push(`Omborni tozalash`);
        const clearRes = await clearAllMedicines(activeRepo);
        refreshData = true;
        actionTaken = "ALL_CLEARED";
        executionNote = `\n\n🗑️ **Ombordagi ${clearRes.count} ta dori to'liq tozalandi.**`;
      }
    } catch {
      // JSON parse error in action block - ignore and return normal text
    }
  }

  // Clean the action code block from visible chat text so user gets a clean, human reply
  let cleanVisibleReply = rawAiReply
    .replace(/```(?:action|json)?\s*[\s\S]*?\s*```/g, "")
    .trim();

  if (executionNote) {
    cleanVisibleReply += executionNote;
  }

  const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  thoughts.push("Natija yangilandi va tizim bilan sinxronlashtirildi");

  return {
    reply: cleanVisibleReply || "Buyruq muvaffaqiyatli bajarildi, jigar!",
    actionTaken,
    refreshData,
    durationSeconds,
    thoughts,
    data: {
      activeRepo,
      totalMedicines: stats.total,
    },
  };
}

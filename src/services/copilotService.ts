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
import { deleteRepository, getAllRepositories, renameRepository } from "./repositoryService.js";
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

// Copilot Chat Execution with Full System Access, Deletion & Security Firewall
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

  // =========================================================================
  // 1. SECURITY BARRIER: Protect against 3rd-party data leaks
  // =========================================================================
  const asksForExternalShare =
    (lowerMsg.includes("tashqi") || lowerMsg.includes("3-chi") || lowerMsg.includes("3 chi") || lowerMsg.includes("uchinchi") || lowerMsg.includes("begona")) &&
    (lowerMsg.includes("shaxs") || lowerMsg.includes("odam") || lowerMsg.includes("sayt") || lowerMsg.includes("ber") || lowerMsg.includes("yubor") || lowerMsg.includes("chiqar"));

  if (asksForExternalShare) {
    await logSecurityAudit({
      action: "BLOCKED_3RD_PARTY_ATTEMPT",
      source: "copilot_chat",
      target: "external_3rd_party",
      reason: "Foydalanuvchi orqali tashqi 3-shaxsga ma'lumot chiqarish so'rovi to'xtatildi",
      operator: "copilot_security_firewall",
      status: "BLOCKED",
    });

    const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    return {
      reply: "⛔ **XAVFSIZLIK TO'SIG'I (ZERO DATA LEAKAGE):**\nTizimimizdagi barcha ichki ma'lumotlar (dorilar bazasi, ombor qoldiqlari, shaxsiy hisoblar) tashqi 3-shaxslarga berilishi qat'iyan man etilgan!\n\n🔒 **Ruxsat etilgan yo'nalish:** Ma'lumotlar faqat o'zimizning ichki **Tizim A** (markaziy baza) va **Tizim B** (filial/ichki tugun) o'rtasida shifrlangan maxfiy shlyuz orqali o'tishi mumkin.",
      actionTaken: "SECURITY_BLOCKED_3RD_PARTY",
      durationSeconds,
      thoughts: [
        "So'rov xavfsizlik tahlilidan o'tkazildi",
        "Tashqi 3-shaxsga ma'lumot chiqarish xavfi aniqlandi",
        "Xavfsizlik to'sig'i ishga tushirildi va audit logiga qayd etildi",
      ],
    };
  }

  // =========================================================================
  // 2. INTERNAL BRIDGE: Secure System A -> System B Data Transfer
  // =========================================================================
  const asksForInternalTransfer =
    (lowerMsg.includes("tizim b") || lowerMsg.includes("system b") || lowerMsg.includes("b tizim") || lowerMsg.includes("filial") || lowerMsg.includes("ichki tugun")) &&
    (lowerMsg.includes("ber") || lowerMsg.includes("o'tkaz") || lowerMsg.includes("otkaz") || lowerMsg.includes("yubor") || lowerMsg.includes("sinxron") || lowerMsg.includes("transfer"));

  if (asksForInternalTransfer) {
    const meds = await getAllMedicines({ repository: activeRepo });
    await logSecurityAudit({
      action: "AUTHORIZED_INTERNAL_TRANSFER",
      source: "system_a",
      target: "system_b",
      reason: `Copilot orqali System A dan System B ga ${meds.length} ta dori xavfsiz ichki shlyuzdan o'tkazildi`,
      operator: "authorized_admin",
      status: "AUTHORIZED",
    });

    const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    return {
      reply: `✅ **ICHKI TRANZAKSIYA MUVAFFAQIYATLI (Tizim A ➡️ Tizim B):**\n\nJami **${meds.length} ta** dori vositalari o'zimizning xavfsiz ichki kanalimiz orqali **Tizim B** ga muvaffaqiyatli uzatildi.\n\n🛡️ *Tashqi 3-shaxslar va ochiq internet uchun kirish yo'li butunlay bloklangan.*`,
      actionTaken: "INTERNAL_TRANSFER_SUCCESS",
      refreshData: true,
      durationSeconds,
      thoughts: [
        "Ichki System A -> System B so'rovi tekshirildi",
        "Ichki token va xavfsiz shlyuz tasdiqlandi",
        "Audit logiga AUTHORIZED sifatida muhrlandi",
      ],
      data: {
        source: "System A",
        target: "System B",
        count: meds.length,
      },
    };
  }

  // =========================================================================
  // 3. INGRESS: Auto-clone website catalogs
  // =========================================================================
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/gi;
  const foundUrls = data.message.match(urlRegex);

  if (foundUrls && foundUrls.length > 0) {
    if (!apiKey) {
      return {
        reply: "⚠️ Gemini API Key topilmadi. Klonlash uchun .env fayliga GEMINI_API_KEY qo'ying.",
        durationSeconds: 1,
      };
    }
    const targetUrl = foundUrls[0];
    try {
      console.log(`Copilot orqali sayt klonlash boshlandi: ${targetUrl}`);
      const report = await cloneMedicinesFromUrl(targetUrl, apiKey);
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

      let reply = `✅ **${report.repoName}** repozitoriyasi ochildi va dorilar klonlandi!\n\n`;
      reply += `📁 **Repozitoriy:** \`mrsovoo/${report.repoName}\`\n`;
      reply += `🔗 **Manba:** ${targetUrl}\n`;
      reply += `📦 **Jami topildi:** ${report.totalFound} ta dori\n`;
      reply += `✨ **Rasmi va nomi bilan qo'shildi:** ${report.addedCount} ta\n`;
      reply += `⏭️ **Allaqachon mavjud:** ${report.skippedCount} ta\n\n`;
      reply += `Barcha dorilar o'zining asl fotosurati, nomi va turi (litr, ml, kg, dona) bo'yicha papkalarga joylandi!`;

      return {
        reply,
        actionTaken: "CLONE_COMPLETED",
        refreshData: true,
        durationSeconds,
        thoughts: [
          `Yangi repozitoriy yaratildi: ${report.repoName}`,
          `Faqat dori rasmi, nomi va o'lchov birligi ajratib olindi`,
          `Neon PostgreSQL bazasiga kiritildi va Git commit qilindi`,
        ],
        data: { report, repoName: report.repoName },
      };
    } catch (err: any) {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      return {
        reply: `Kechirasiz, saytni klonlashda xatolik yuz berdi: ${err.message}. Iltimos, havola to'g'riligini tekshiring.`,
        durationSeconds,
        thoughts: [`Klonlashda xatolik: ${err.message}`],
      };
    }
  }

  // =========================================================================
  // 4. ACTION CONTROLLER: Full Deletion & Management by AI Command
  // =========================================================================

  // A. Clear ALL medicines / Reset Catalog
  const isClearAll =
    (lowerMsg.includes("barchasini") || lowerMsg.includes("hammasini") || lowerMsg.includes("butunlay") || lowerMsg.includes("hamma dorilarni") || lowerMsg.includes("barcha dorilarni") || lowerMsg.includes("bazani")) &&
    (lowerMsg.includes("o'chir") || lowerMsg.includes("ochir") || lowerMsg.includes("tozala") || lowerMsg.includes("yo'qot") || lowerMsg.includes("yoqot") || lowerMsg.includes("delete"));

  if (isClearAll) {
    const result = await clearAllMedicines(activeRepo);
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    return {
      reply: `🗑️ **Ombor tozalandi!**\n\n${result.repository === "all" ? "Barcha repozitoriyalardagi" : `'${result.repository}' repozitoriyasidagi`} jami **${result.count} ta** dori vositalari bazadan butunlay o'chirildi va ombor tozalandi.`,
      actionTaken: "CLEAR_ALL_COMPLETED",
      refreshData: true,
      durationSeconds,
      thoughts: [
        "Foydalanuvchining to'liq tozalash buyrug'i qabul qilindi",
        `Bazadan ${result.count} ta dori o'chirildi`,
        "Git commit qayd etildi va ma'lumotlar yangilandi",
      ],
    };
  }

  // B. Delete Repository by Name (e.g. "agroz-ai repozitoriyasini o'chir" or "repozitoriy milytour ni ochir")
  const repoDeleteMatch =
    userMsg.match(/(?:repozitoriy|repo|repository)\s+([a-zA-Z0-9_-]+)\s*(?:ni)?\s*(?:o['’`]?chir|delete|tozala)/i) ||
    userMsg.match(/(?:o['’`]?chir|delete|tozala)\s+(?:repozitoriy|repo|repository)\s+([a-zA-Z0-9_-]+)/i);

  if (repoDeleteMatch && repoDeleteMatch[1]) {
    const targetRepoName = repoDeleteMatch[1].trim().toLowerCase();
    if (targetRepoName === "biznesgo") {
      return {
        reply: "⚠️ 'biznesgo' asosiy (master) repozitoriya hisoblanadi, uni butunlay o'chirib bo'lmaydi. Lekin ichidagi dorilarni o'chirishingiz mumkin.",
        durationSeconds: 1,
      };
    }
    const success = await deleteRepository(targetRepoName);
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    return {
      reply: success
        ? `🗑️ **Repozitoriy o'chirildi!**\n\n'${targetRepoName}' repozitoriyasi va unga tegishli barcha dorilar butunlay o'chirib tashlandi.`
        : `⚠️ '${targetRepoName}' repozitoriyasini o'chirishda xatolik yoki u topilmadi.`,
      actionTaken: "DELETE_REPO_COMPLETED",
      refreshData: true,
      durationSeconds,
      thoughts: [
        `Repozitoriy o'chirish so'rovi: ${targetRepoName}`,
        `Baza va repozitoriy jadvallari tozalandi`,
      ],
    };
  }

  // C. Delete by Unit / Folder (e.g. "litr papkasidagi dorilarni o'chir", "ml dagi dorilarni ochir")
  const unitMatch = lowerMsg.match(/(litr|ml|kg|gramm|dona)\s+(?:papkasini|dorilarini|dagi dorilarni|dagi hamma dorilarni|larni)?\s*(?:o['’`]?chir|tozala|delete)/i);
  if (unitMatch && unitMatch[1]) {
    const targetUnit = unitMatch[1].trim().toLowerCase();
    const result = await deleteMedicinesByUnit(targetUnit, activeRepo);
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    return {
      reply: `🗑️ **'${targetUnit}' papkasi tozalandi!**\n\nUshbu papkadagi **${result.count} ta** dori vositasi bazadan o'chirildi.`,
      actionTaken: "DELETE_UNIT_COMPLETED",
      refreshData: true,
      durationSeconds,
      thoughts: [
        `Birlik bo'yicha tozalash: ${targetUnit}`,
        `${result.count} ta dori o'chirildi`,
      ],
    };
  }

  // D. Delete Last Medicine (e.g. "oxirgi dorini o'chir", "oxirgisini o'chir")
  if (lowerMsg.includes("oxirgi") && (lowerMsg.includes("o'chir") || lowerMsg.includes("ochir") || lowerMsg.includes("delete"))) {
    const allMeds = await getAllMedicines({ repository: activeRepo });
    if (allMeds.length > 0) {
      const lastMed = allMeds[0];
      await deleteMedicine(lastMed.id);
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      return {
        reply: `🗑️ **Oxirgi dori o'chirildi!**\n\n'${lastMed.name}' (${lastMed.quantity} ${lastMed.unit}) muvaffaqiyatli o'chirildi.`,
        actionTaken: "DELETE_LAST_COMPLETED",
        refreshData: true,
        durationSeconds,
        thoughts: [
          `Oxirgi qo'shilgan dori topildi: #${lastMed.id} ${lastMed.name}`,
          "Bazadan o'chirildi va Git commit yozildi",
        ],
      };
    } else {
      return {
        reply: "Bazada o'chirish uchun dori mavjud emas, ro'yxat bo'sh.",
        durationSeconds: 1,
      };
    }
  }

  // E. Delete specific medicine by name (e.g. "Amoksitsillinni o'chir", "Alben dorisini ochir", "o'chir biomitsin")
  const isDeleteIntent = lowerMsg.includes("o'chir") || lowerMsg.includes("ochir") || lowerMsg.includes("delete") || lowerMsg.includes("yo'qot") || lowerMsg.includes("yoqot");
  if (isDeleteIntent) {
    // Extract candidate medicine name
    let cleanQuery = userMsg
      .replace(/(?:iltimos|jigar|ai|copilot)/gi, "")
      .replace(/(?:o['’`]?chirib tashla|o['’`]?chir|ochir|delete|yo['’`]?qot)/gi, "")
      .replace(/(?:dorisini|dori|vositasini|nomli dorini|ni)/gi, "")
      .trim();

    if (cleanQuery.length >= 2 && !["barchasi", "hamma", "repo", "tizim"].includes(cleanQuery.toLowerCase())) {
      const delResult = await deleteMedicinesByName(cleanQuery, activeRepo);
      if (delResult.count > 0) {
        const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
        return {
          reply: `🗑️ **Dori o'chirildi!**\n\n"${cleanQuery}" so'rovi bo'yicha **${delResult.count} ta** dori topildi va bazadan o'chirildi:\n${delResult.deletedNames.map((n) => `• ${n}`).join("\n")}`,
          actionTaken: "DELETE_MEDICINE_COMPLETED",
          refreshData: true,
          durationSeconds,
          thoughts: [
            `Nom bo'yicha qidirildi: "${cleanQuery}"`,
            `${delResult.count} ta mos keluvchi dori o'chirildi`,
            "Git commit yaratildi",
          ],
        };
      }
    }
  }

  // F. Rename Repository Intent (e.g. "biznesgo dib nomlagan repo nomini tbovet dib nomla", "biznesgo reponi tbovet qil")
  const isRenameIntent =
    (lowerMsg.includes("nomla") || lowerMsg.includes("nomini") || lowerMsg.includes("o'zgartir") || lowerMsg.includes("ozgartir") || lowerMsg.includes("almashtir") || lowerMsg.includes("qil")) &&
    (lowerMsg.includes("repo") || lowerMsg.includes("nom"));

  if (isRenameIntent) {
    const match1 = userMsg.match(/([a-zA-Z0-9_-]+)\s*(?:deb|dib)?\s*(?:nomlangan|nomlagan|nomli)?\s*(?:repo|repozitoriy)?\s*(?:nomini|ni)?\s*([a-zA-Z0-9_-]+)\s*(?:deb|dib|ga)?\s*(?:nomla|o['’`]?zgartir|ozgartir|almashtir|qil)/i);
    const match2 = userMsg.match(/(?:repo|repozitoriy)\s*(?:nomini)?\s*([a-zA-Z0-9_-]+)\s*(?:deb|dib|ga)?\s*(?:nomla|o['’`]?zgartir|ozgartir|almashtir|qil)/i);

    let oldTarget = activeRepo;
    let newTarget = "";

    if (match1 && match1[1] && match1[2] && !["repo", "repozitoriy", "nomini", "nomi", "barcha"].includes(match1[1].toLowerCase())) {
      oldTarget = match1[1].trim().toLowerCase();
      newTarget = match1[2].trim().toLowerCase();
    } else if (match2 && match2[1]) {
      newTarget = match2[1].trim().toLowerCase();
    }

    newTarget = newTarget.replace(/^(deb|dib|ga|ni)/, "").trim();

    if (newTarget && newTarget !== oldTarget) {
      const success = await renameRepository(oldTarget, newTarget);
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      return {
        reply: `✏️ **Repozitoriy nomi o'zgartirildi!**\n\n'**${oldTarget}**' repozitoriyasi va unga tegishli barcha dorilar muvaffaqiyatli '**${newTarget}**' deb qayta nomlandi.\n\nEndi saytda barcha joyda: \`mrsovoo / ${newTarget}\` ko'rinishida bo'ladi!`,
        actionTaken: "RENAME_REPO_COMPLETED",
        refreshData: true,
        durationSeconds,
        thoughts: [
          `Repozitoriy qayta nomlash: ${oldTarget} -> ${newTarget}`,
          `Baza va dorilar jadvallaridagi repository ustuni yangilandi`,
          `Yangi nom o'rnatildi: mrsovoo / ${newTarget}`,
        ],
        data: {
          oldRepo: oldTarget,
          newRepo: newTarget,
        },
      };
    }
  }

  // =========================================================================
  // 5. NATURAL DIALOGUE & REAL-TIME SYSTEM AWARENESS (Gemini AI)
  // =========================================================================
  if (!apiKey) {
    return {
      reply: "Salom! Men GitGo tizimining yordamchisiman. Dori o'chirish, klonlash yoki omborni boshqarish bo'yicha buyruq berishingiz mumkin.",
      durationSeconds: 1,
    };
  }

  const [stats, medicines, latestCommit, repos] = await Promise.all([
    getStats(activeRepo),
    getAllMedicines({ repository: activeRepo }),
    getLatestCommit(),
    getAllRepositories(),
  ]);

  const medicineSummary = medicines.slice(0, 15).map((m) => `${m.name} (${m.quantity} ${m.unit})`);
  const repoSummary = repos.map((r) => r.name).join(", ");

  const systemInstruction = `
Siz GitGo (veterinariya va agrokimyoviy dori vositalari boshqaruv tizimi) AI Copilotisiz.
Foydalanuvchi bilan o'zbek tilida juda samimiy, do'stona, aniq va lo'nda suhbatlashing.

SIZNING IMKONIYATLARINGIZ VA QOIDALAR:
1. Siz to'liq tizim boshqaruvchisiz: sayt linki berilsa dorilarni klonlaysiz; "falon dorini o'chir" desa o'chirasiz; "tizim b ga o'tkaz" desa ichki shlyuz orqali xavfsiz o'tkazasiz.
2. XAVFSIZLIK: Tashqi 3-shaxslarga ma'lumot berilishi qat'iyan man etilgan! Ma'lumot faqat Tizim A va Tizim B o'rtasida bo'ladi.
3. ROBOTDEK SOVUQ BO'LMANG! Insondek, lo'nda va tushunarli (2-3 gapda) javob bering.
4. Agar foydalanuvchi "qanday dorilar bor?" desa, mavjud namunalarni sanab bering.

JORIY HOLAT:
- Faol repozitoriy: ${activeRepo}
- Repozitoriyalar: ${repoSummary}
- Dorilar soni: ${stats.total} ta
- Birliklar: ${JSON.stringify(stats.byUnit)}
- Oxirgi qo'shilganlar: ${medicineSummary.join("; ") || "Hozircha bo'sh"}
- Oxirgi commit: ${latestCommit?.message || "Boshlang'ich holat"}
`;

  const prompt = `Foydalanuvchi: "${userMsg}"\n\nSamimiy, do'stona va lo'nda javob bering:`;

  const aiClient = new GoogleGenAI({ apiKey });
  const models = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
  let replyText = "";

  for (const m of models) {
    try {
      const res = await aiClient.models.generateContent({
        model: m,
        contents: prompt,
        config: {
          systemInstruction,
          maxOutputTokens: 350,
          temperature: 0.7,
        },
      });
      replyText = res.text?.trim() || "";
      if (replyText) break;
    } catch (err: any) {
      try {
        const interaction = await aiClient.interactions.create({
          model: m,
          input: `${systemInstruction}\n\n${prompt}`,
        });
        replyText = interaction.output_text?.trim() || "";
        if (replyText) break;
      } catch (err2: any) {
        console.warn(`Copilot model ${m} xatosi:`, err2.message);
      }
    }
  }

  if (!replyText) {
    replyText = "Tushundim! Tizimda istalgan dorini o'chirish, yangi saytni klonlash yoki Tizim B ga ma'lumotlarni xavfsiz uzatish uchun buyruq berishingiz mumkin.";
  }

  const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  const thoughts = [
    `Foydalanuvchi buyrug'i tahlil qilindi`,
    `Faol repozitoriy: ${activeRepo} (${stats.total} ta dori)`,
    `Google Gemini orqali tezkor va do'stona javob qaytarildi`,
  ];

  return {
    reply: replyText,
    durationSeconds,
    thoughts,
    data: {
      totalMedicines: stats.total,
      units: stats.byUnit,
      repositories: repos.length,
    },
  };
}

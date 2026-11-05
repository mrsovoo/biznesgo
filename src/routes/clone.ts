import { Router } from "express";
import { cloneMedicinesFromUrl, CloneReport } from "../services/aiCloneService.js";
import { config } from "../config.js";

const router = Router();

// Check if Gemini API key is configured
router.get("/clone/status", (req, res) => {
  const hasKey = Boolean(config.geminiApiKey || process.env.GEMINI_API_KEY);
  res.json({
    success: true,
    hasApiKey: hasKey,
    model: "gemini-3.8-flash",
  });
});

// Scan & Clone single or multiple URLs
router.post("/clone/scan", async (req, res) => {
  try {
    const { url, urls, apiKey } = req.body;

    const targetUrls: string[] = [];
    if (url && typeof url === "string") {
      targetUrls.push(url.trim());
    }
    if (Array.isArray(urls)) {
      urls.forEach((u) => {
        if (typeof u === "string" && u.trim().startsWith("http")) {
          targetUrls.push(u.trim());
        }
      });
    }

    if (targetUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Kamida bitta to'g'ri sayt havolasi (URL) kiritilishi shart (masalan: https://...)",
      });
    }

    const reports: CloneReport[] = [];
    let grandTotalFound = 0;
    let grandAdded = 0;
    let grandSkipped = 0;

    for (const targetUrl of targetUrls) {
      try {
        console.log(`🤖 [GitGo Clone] Sayt tahlil qilinmoqda: ${targetUrl}`);
        const report = await cloneMedicinesFromUrl(targetUrl, apiKey);
        reports.push(report);
        grandTotalFound += report.totalFound;
        grandAdded += report.addedCount;
        grandSkipped += report.skippedCount;
      } catch (err: any) {
        console.error(`URL klonlashda xato (${targetUrl}):`, err.message);
        reports.push({
          url: targetUrl,
          repoName: "error-repo",
          totalFound: 0,
          addedCount: 0,
          skippedCount: 0,
          items: [],
        });
      }
    }

    res.json({
      success: true,
      message: `Tahlil yakunlandi! Jami topildi: ${grandTotalFound} ta, Yangi qo'shildi: ${grandAdded} ta, Mavjudligi uchun o'tkazib yuborildi: ${grandSkipped} ta.`,
      stats: {
        totalFound: grandTotalFound,
        addedCount: grandAdded,
        skippedCount: grandSkipped,
      },
      reports,
    });
  } catch (error: any) {
    console.error("Clone API xatoligi:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Saytdan klonlashda xatolik yuz berdi",
    });
  }
});

export default router;


import axios from "axios";
import * as cheerio from "cheerio";
import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";
import {
  createMedicine,
  findMedicineByName,
  Medicine,
} from "./medicineService.js";
import { recordCommit } from "./commitService.js";

export interface CloneResultItem {
  name: string;
  unit: string;
  quantity: string;
  image_url: string | null;
  category: string;
  description: string;
  status: "added" | "skipped";
  reason?: string;
  savedMedicine?: Medicine;
}

export interface CloneReport {
  url: string;
  totalFound: number;
  addedCount: number;
  skippedCount: number;
  items: CloneResultItem[];
}

export async function cloneMedicinesFromUrl(
  pageUrl: string,
  userApiKey?: string
): Promise<CloneReport> {
  const apiKey = userApiKey || config.geminiApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY topilmadi. Iltimos, .env fayliga GEMINI_API_KEY kiriting yoki GitGo Clone panelida kalitni kiriting."
    );
  }

  // 1. Fetch webpage HTML
  let html = "";
  try {
    const res = await axios.get(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
    });
    html = res.data;
  } catch (err: any) {
    throw new Error(`Saytni ochib bo'lmadi (${pageUrl}): ${err.message}`);
  }

  // 2. Parse HTML and gather images & readable text with Cheerio
  const $ = cheerio.load(html);

  // Remove scripts, styles, iframes
  $("script, style, noscript, svg, nav, footer, header").remove();

  // Extract all valid image URLs
  const imageUrls: string[] = [];
  $("img").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (src && !src.startsWith("data:") && !src.includes("icon") && !src.includes("logo")) {
      try {
        const fullUrl = new URL(src, pageUrl).href;
        if (!imageUrls.includes(fullUrl)) {
          imageUrls.push(fullUrl);
        }
      } catch {
        // ignore invalid url
      }
    }
  });

  // Extract text
  const bodyText = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 30000); // Send up to 30,000 characters to Gemini

  if (!bodyText || bodyText.length < 50) {
    throw new Error("Saytdan dori ma'lumotlarini o'qib bo'lmadi (matn juda qisqa yoki bo'sh).");
  }

  // 3. Call Gemini (with automatic fallback: 3.8-flash -> 3.5-flash-lite -> 3.1-flash-lite)
  const aiClient = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert pharmacology data extractor specializing in veterinary and agricultural (vet & agro) medicines.
Analyze the following webpage content and list of product images:

URL: ${pageUrl}
Discovered product images: ${JSON.stringify(imageUrls.slice(0, 40))}

Webpage text:
"""
${bodyText}
"""

Task:
Extract all distinct medicine/drug products found on this page.
For each medicine:
- "name": Clean official brand/trade name (e.g. 'Enroflon 10%', 'Biovit-80', 'Ivermektin', 'Oksitetratsiklin 20%').
- "unit": Exact measurement unit, MUST BE ONE OF: "litr", "ml", "kg", "gramm", or "dona".
- "quantity": Standard package size or dosage number (e.g. '1', '100', '500', '10', '2.5').
- "image_url": The most matching full image URL from the discovered product images list, or null if no matching image.
- "category": One of "antibiotik", "vitamin", "antiparazitar", "agroximikat", "vaksina", "dezinfeksiya", "boshqa".
- "description": 1 concise sentence in Uzbek or Russian explaining what the drug treats or how it is used.

Respond with ONLY valid raw JSON array of objects (no markdown fences, no extra commentary):
[
  {
    "name": "...",
    "unit": "litr",
    "quantity": "1",
    "image_url": "...",
    "category": "antibiotik",
    "description": "..."
  }
]
`;

  let extractedList: any[] = [];
  const candidateModels = ["gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const interaction = await aiClient.interactions.create({
        model,
        input: prompt,
      });

      const responseText = interaction.output_text || "";
      const cleanJson = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      extractedList = JSON.parse(cleanJson);
      if (Array.isArray(extractedList)) {
        break; // Successfully extracted
      }
    } catch (err: any) {
      console.warn(`Model ${model} vaqtincha javob bermadi, navbatdagi modelga o'tilmoqda:`, err.message);
      lastError = err;
    }
  }

  if (!Array.isArray(extractedList) || extractedList.length === 0) {
    if (lastError && (!extractedList || extractedList.length === 0)) {
      console.error("Barcha Gemini modellari xatolik berdi:", lastError);
      throw new Error(`Gemini AI bilan tahlil qilishda xatolik: ${lastError.message}`);
    }
  }

  // 4. Deduplicate against Neon PostgreSQL database
  const reportItems: CloneResultItem[] = [];
  let addedCount = 0;
  let skippedCount = 0;

  for (const item of extractedList) {
    if (!item.name || !item.unit) continue;

    const existing = await findMedicineByName(item.name, item.unit);

    if (existing) {
      skippedCount++;
      reportItems.push({
        name: item.name,
        unit: item.unit.toLowerCase(),
        quantity: String(item.quantity || "1"),
        image_url: item.image_url || null,
        category: item.category || "boshqa",
        description: item.description || "",
        status: "skipped",
        reason: `Bazada allaqachon mavjud (ID: #${existing.id})`,
      });
    } else {
      addedCount++;
      const saved = await createMedicine({
        telegram_user_id: 1000000, // System AI Clone user
        telegram_username: "ai_clone_gemini",
        name: item.name,
        unit: item.unit.toLowerCase(),
        quantity: String(item.quantity || "1"),
        photo_file_id: item.image_url || "external_web_clone",
        photo_url: item.image_url || null,
        description: item.description || null,
        source_url: pageUrl,
        category: item.category || "boshqa",
      });

      reportItems.push({
        name: item.name,
        unit: item.unit.toLowerCase(),
        quantity: String(item.quantity || "1"),
        image_url: item.image_url || null,
        category: item.category || "boshqa",
        description: item.description || "",
        status: "added",
        savedMedicine: saved,
      });
    }
  }

  // Auto-record commit for GitGo / GitHub commit strip
  try {
    let hostname = pageUrl;
    try {
      hostname = new URL(pageUrl).hostname;
    } catch {}

    const commitMessage =
      addedCount > 0
        ? `feat(clone): import ${addedCount} medications from ${hostname} (${skippedCount} duplicates skipped)`
        : `chore(clone): scanned ${hostname} — all ${skippedCount} items already exist in database`;

    await recordCommit({
      author: "ai-clone[bot]",
      folder: "root",
      message: commitMessage,
      details: {
        url: pageUrl,
        addedCount,
        skippedCount,
        totalFound: extractedList.length,
      },
    });
  } catch (e: any) {
    console.warn("Clone commit yozishda ogohlantirish:", e.message);
  }

  return {
    url: pageUrl,
    totalFound: extractedList.length,
    addedCount,
    skippedCount,
    items: reportItems,
  };
}


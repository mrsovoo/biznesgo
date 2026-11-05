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
import { createRepository, deriveRepoNameFromUrl } from "./repositoryService.js";

export interface CloneResultItem {
  name: string;
  unit: string;
  quantity: string;
  image_url: string | null;
  status: "added" | "skipped";
  reason?: string;
  savedMedicine?: Medicine;
}

export interface CloneReport {
  url: string;
  repoName: string;
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

  // 1. Create or ensure Repository for this website exists
  const repoName = deriveRepoNameFromUrl(pageUrl);
  await createRepository(repoName, pageUrl, `${repoName} dan klonlangan katalog`);

  // 2. Fetch webpage HTML
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

  // 3. Parse HTML and gather images & readable text with Cheerio
  const $ = cheerio.load(html);

  // Remove scripts, styles, iframes
  $("script, style, noscript, svg, nav, footer, header").remove();

  // Extract all valid image URLs (product photos)
  const imageUrls: string[] = [];
  $("img").each((_, el) => {
    const src =
      $(el).attr("src") ||
      $(el).attr("data-src") ||
      $(el).attr("data-lazy-src") ||
      $(el).attr("data-original");
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
    .slice(0, 30000);

  if (!bodyText || bodyText.length < 30) {
    throw new Error("Saytdan dori ma'lumotlarini o'qib bo'lmadi (matn juda qisqa yoki bo'sh).");
  }

  // 4. Call Gemini - only extract Name, Unit, Quantity, and Image URL (no descriptions, blazing fast!)
  const aiClient = new GoogleGenAI({ apiKey });

  const prompt = `
Extract all veterinary and agricultural (vet & agro) medicine products from this webpage:
URL: ${pageUrl}

Product images found on page:
${JSON.stringify(imageUrls.slice(0, 50))}

Page text:
"""
${bodyText}
"""

Task:
Extract each medicine. ONLY return these 4 fields (NO descriptions, NO bloat):
- "name": Clean brand or trade name (e.g. 'Enroflon 10%', 'Biovit-80', 'Ivermektin', 'Oksitetratsiklin').
- "unit": MUST be strictly one of: "litr", "ml", "kg", "gramm", "dona".
- "quantity": Number (e.g. '1', '100', '500', '10').
- "image_url": Full valid image URL from the product images list that matches this medicine, or null.

Respond ONLY with raw JSON array:
[
  {
    "name": "...",
    "unit": "litr",
    "quantity": "1",
    "image_url": "..."
  }
]
`;

  let extractedList: any[] = [];
  const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.5-flash-lite", "gemini-3.8-flash"];
  let lastError: any = null;

  function parseJsonArraySafe(text: string): any[] {
    try {
      const clean = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed)) return parsed;
    } catch {}

    // Resilient repair: find last complete object closing brace '}'
    try {
      let fixed = text.trim();
      const lastBrace = fixed.lastIndexOf("}");
      if (lastBrace !== -1) {
        fixed = fixed.slice(0, lastBrace + 1) + "]";
        const firstBracket = fixed.indexOf("[");
        if (firstBracket !== -1) {
          fixed = fixed.slice(firstBracket);
          const parsed = JSON.parse(fixed);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch {}

    // Match individual objects regex
    const matches = text.match(/\{[^{}]*"name"[^{}]*\}/g);
    if (matches) {
      const items = [];
      for (const m of matches) {
        try {
          const obj = JSON.parse(m);
          if (obj.name) items.push(obj);
        } catch {}
      }
      if (items.length > 0) return items;
    }
    return [];
  }

  for (const model of candidateModels) {
    try {
      const res = await aiClient.models.generateContent({
        model,
        contents: prompt,
        config: {
          maxOutputTokens: 4096,
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      const responseText = res.text || "";
      extractedList = parseJsonArraySafe(responseText);
      if (Array.isArray(extractedList) && extractedList.length > 0) {
        break;
      }
    } catch (err: any) {
      console.warn(`Model ${model} xatosi:`, err.message);
      lastError = err;
    }
  }

  // Fallback: If AI model had quota/high-demand error, extract directly from HTML cards via Cheerio
  if (!Array.isArray(extractedList) || extractedList.length === 0) {
    console.log("Gemini javob bermadi, Cheerio orqali HTML kartochkalaridan ajratib olinmoqda...");
    const htmlCards: any[] = [];
    $("[class*='product'], [class*='item'], .card, article").each((_, el) => {
      const name = $(el).find("h2, h3, h4, .title, [class*='title'], [class*='name']").first().text().trim();
      const img = $(el).find("img").first().attr("src") || $(el).find("img").first().attr("data-src");
      if (name && name.length >= 2 && name.length <= 100 && !htmlCards.some((c) => c.name === name)) {
        let fullImg: string | null = null;
        if (img) {
          try {
            fullImg = new URL(img, pageUrl).href;
          } catch {}
        }
        htmlCards.push({
          name,
          unit: name.toLowerCase().includes("litr") || name.toLowerCase().includes("1l") ? "litr" : name.toLowerCase().includes("kg") ? "kg" : "dona",
          quantity: "1",
          image_url: fullImg,
        });
      }
    });

    if (htmlCards.length > 0) {
      extractedList = htmlCards.slice(0, 30);
    } else if (lastError) {
      throw new Error(`Gemini AI tahlilida xatolik: ${lastError.message}`);
    }
  }

  // 5. Deduplicate and Save to Neon PostgreSQL database under the site's repository
  const reportItems: CloneResultItem[] = [];
  let addedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < extractedList.length; i++) {
    const item = extractedList[i];
    if (!item.name || !item.unit) continue;

    const existing = await findMedicineByName(item.name, item.unit);

    // If no matching image was selected, assign from available page images
    let resolvedImage = item.image_url;
    if (!resolvedImage && imageUrls.length > 0) {
      resolvedImage = imageUrls[i % imageUrls.length];
    }

    if (existing) {
      skippedCount++;
      reportItems.push({
        name: item.name,
        unit: item.unit.toLowerCase(),
        quantity: String(item.quantity || "1"),
        image_url: resolvedImage || null,
        status: "skipped",
        reason: `Bazada allaqachon mavjud (ID: #${existing.id})`,
      });
    } else {
      addedCount++;
      const saved = await createMedicine({
        telegram_user_id: 1000000,
        telegram_username: "ai_clone_gemini",
        name: item.name,
        unit: item.unit.toLowerCase(),
        quantity: String(item.quantity || "1"),
        photo_file_id: resolvedImage || "external_web_clone",
        photo_url: resolvedImage || null,
        source_url: pageUrl,
        category: "agro_vet",
        repository: repoName,
      });

      reportItems.push({
        name: item.name,
        unit: item.unit.toLowerCase(),
        quantity: String(item.quantity || "1"),
        image_url: resolvedImage || null,
        status: "added",
        savedMedicine: saved,
      });
    }
  }

  // Record Git commit under the repository name
  try {
    const commitMessage =
      addedCount > 0
        ? `feat(${repoName}): clone ${addedCount} medications with photos (${skippedCount} duplicates skipped)`
        : `chore(${repoName}): scan ${repoName} — all ${skippedCount} items already exist in database`;

    await recordCommit({
      author: "ai-clone[bot]",
      folder: "root",
      message: commitMessage,
      details: {
        url: pageUrl,
        repoName,
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
    repoName,
    totalFound: extractedList.length,
    addedCount,
    skippedCount,
    items: reportItems,
  };
}


import { Router } from "express";
import axios from "axios";
import { config } from "../config.js";

const router = Router();

// In-memory cache for file paths so we don't spam getFile
const filePathCache = new Map<string, string>();

router.get("/images/telegram/:file_id", async (req, res) => {
  const { file_id } = req.params;

  if (!config.botToken) {
    return res.status(500).send("BOT_TOKEN sozlanmagan");
  }

  try {
    let filePath = filePathCache.get(file_id);

    if (!filePath) {
      const getFileUrl = `https://api.telegram.org/bot${config.botToken}/getFile?file_id=${file_id}`;
      const response = await axios.get(getFileUrl);

      if (!response.data.ok || !response.data.result?.file_path) {
        return res.status(404).send("Telegram rasmi topilmadi");
      }

      filePath = response.data.result.file_path;
      filePathCache.set(file_id, filePath!);
    }

    const downloadUrl = `https://api.telegram.org/file/bot${config.botToken}/${filePath}`;
    const imageStream = await axios.get(downloadUrl, {
      responseType: "stream",
    });

    const contentType = (imageStream.headers["content-type"] as string) || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=604800, immutable"); // Cache for 7 days
    imageStream.data.pipe(res);
  } catch (error: any) {
    console.error("Telegram rasmini olishda xatolik:", error.message);
    res.status(502).send("Rasm yuklab olinmadi");
  }
});

export default router;

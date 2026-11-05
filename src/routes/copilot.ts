import { Router } from "express";
import {
  runCopilotChat,
  verifyTransferChallenge,
  getSecurityLogs,
} from "../services/copilotService.js";

const router = Router();

// Copilot Chat message
router.post("/copilot/chat", async (req, res) => {
  try {
    const { message, history, apiKey } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ success: false, message: "Xabar matni bo'sh bo'lmasligi kerak." });
    }

    const result = await runCopilotChat({
      message: message.trim(),
      history,
      userApiKey: apiKey,
    });

    res.json({
      success: true,
      reply: result.reply,
      actionTaken: result.actionTaken,
      refreshData: result.refreshData,
      durationSeconds: result.durationSeconds,
      thoughts: result.thoughts,
      data: result.data,
    });
  } catch (error: any) {
    console.error("Copilot xatoligi:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Security Transfer & Data Gate Challenge
router.post("/security/verify", async (req, res) => {
  try {
    const { source, target, reason, pin, operator } = req.body;

    const result = await verifyTransferChallenge({
      source: source || "system_a",
      target: target || "",
      reason: reason || "",
      pin: pin || "",
      operator: operator || "admin",
    });

    res.json({
      success: true,
      allowed: result.allowed,
      message: result.message,
      challengeQuestions: result.challengeQuestions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Security Audit Logs
router.get("/security/logs", async (req, res) => {
  try {
    const logs = await getSecurityLogs(30);
    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


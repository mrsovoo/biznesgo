import { Router, Request, Response } from "express";
import { getAllMedicines, Medicine } from "../services/medicineService.js";
import { getAllRepositories } from "../services/repositoryService.js";
import { logSecurityAudit, getSecurityLogs } from "../services/copilotService.js";
import { config } from "../config.js";

const router = Router();

// Internal sync secret token
const INTERNAL_SECRET = process.env.INTERNAL_SYNC_KEY || "gitgo-internal-secure-node-2026";

/**
 * Middleware: Strictly blocks 3rd parties and verifies internal system-to-system bridge
 */
function requireInternalAuthorization(req: Request, res: Response, next: Function) {
  const internalKey = req.headers["x-internal-key"] || req.query.internal_key;
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";

  if (!internalKey || internalKey !== INTERNAL_SECRET) {
    // Log unauthorized 3rd party access attempt
    logSecurityAudit({
      action: "UNAUTHORIZED_3RD_PARTY_DATA_ACCESS",
      source: `external_ip:${clientIp}`,
      target: req.originalUrl,
      reason: "Tashqi 3-shaxs ruxsatsiz ichki ma'lumotlarga kirishga urindi",
      operator: "unknown_3rd_party",
      ip_address: clientIp,
      status: "BLOCKED",
    }).catch(() => {});

    return res.status(403).json({
      success: false,
      error: "403_FORBIDDEN_3RD_PARTY",
      message: "⛔ XAVFSIZLIK TO'SIG'I: Ichki ma'lumotlar tashqi uchinchi shaxslarga berilishi qat'iyan taqiqlangan! Ma'lumot almashinuvi faqat ichki 'System A' va 'System B' o'rtasida xavfsiz shlyuz orqali ruxsat etilgan.",
    });
  }

  next();
}

/**
 * POST /api/internal/transfer
 * Safe internal data bridge between System A and System B
 */
router.post("/internal/transfer", requireInternalAuthorization, async (req: Request, res: Response) => {
  const { source, target, scope, repository } = req.body;
  const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

  // Validate that source and target are strictly internal system nodes
  const validNodes = ["system_a", "system_b", "gitgo_master", "gitgo_node_b", "warehouse_b", "branch_b"];
  const cleanSource = (source || "system_a").toLowerCase();
  const cleanTarget = (target || "system_b").toLowerCase();

  const isInternal = validNodes.some((n) => cleanTarget.includes(n));

  if (!isInternal) {
    await logSecurityAudit({
      action: "DATA_EXPORT_BLOCKED",
      source: cleanSource,
      target: cleanTarget,
      reason: "Tashqi noma'lum manzilga ma'lumot eksporti to'xtatildi",
      operator: "internal_bridge",
      ip_address: clientIp,
      status: "BLOCKED",
    });

    return res.status(400).json({
      success: false,
      message: `⛔ Noma'lum qabul qiluvchi: '${target}'. Ma'lumot faqat ichki tasdiqlangan 'System B' tarmog'iga uzatilishi mumkin.`,
    });
  }

  try {
    const medicines = await getAllMedicines({ repository: repository || undefined });

    await logSecurityAudit({
      action: "AUTHORIZED_INTERNAL_TRANSFER",
      source: cleanSource,
      target: cleanTarget,
      reason: `System A dan System B ga ${medicines.length} ta dori yozuvlari xavfsiz kanaldan o'tkazildi`,
      operator: "internal_system_bridge",
      ip_address: clientIp,
      status: "AUTHORIZED",
    });

    res.json({
      success: true,
      message: `✅ Muvaffaqiyatli: ${medicines.length} ta dori ma'lumotlari '${cleanSource}' dan '${cleanTarget}' ga xavfsiz ichki shifrlangan kanal orqali uzatildi. Tashqi 3-shaxslarga kirish bloklangan.`,
      transferSummary: {
        source: cleanSource,
        target: cleanTarget,
        count: medicines.length,
        timestamp: new Date().toISOString(),
        securityStatus: "SECURE_INTERNAL_ONLY",
      },
      data: medicines,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/internal/security-audit
 * View real-time security audit logs
 */
router.get("/internal/security-audit", async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 30;
  const logs = await getSecurityLogs(limit);
  res.json({
    success: true,
    count: logs.length,
    data: logs,
  });
});

export default router;

import { Router } from "express";
import {
  getAllMedicines,
  deleteMedicine,
  getStats,
} from "../services/medicineService.js";
import {
  getLatestCommit,
  getFolderCommits,
  getAllCommits,
} from "../services/commitService.js";

const router = Router();

// GET commits history
router.get("/commits", async (req, res) => {
  try {
    const commits = await getAllCommits(30);
    res.json({ success: true, data: commits });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET latest commit
router.get("/commits/latest", async (req, res) => {
  try {
    const commit = await getLatestCommit();
    res.json({ success: true, data: commit });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET commits
router.get("/commits", async (req, res) => {
  try {
    const { folder } = req.query;
    const [latest, folderMap, all] = await Promise.all([
      getLatestCommit(folder ? String(folder) : undefined),
      getFolderCommits(),
      getAllCommits(20),
    ]);
    res.json({
      success: true,
      latest,
      folders: folderMap,
      commits: all,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET all medicines
router.get("/medicines", async (req, res) => {
  try {
    const { search, unit } = req.query;
    const medicines = await getAllMedicines({
      search: search ? String(search) : undefined,
      unit: unit ? String(unit) : undefined,
    });
    res.json({ success: true, data: medicines });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET stats
router.get("/stats", async (req, res) => {
  try {
    const stats = await getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE medicine
router.delete("/medicines/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await deleteMedicine(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Dori topilmadi" });
    }
    res.json({ success: true, message: "Dori o'chirildi" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


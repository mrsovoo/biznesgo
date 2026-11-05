import { getDbPool } from "../db/index.js";
import { recordCommit } from "./commitService.js";

export interface Medicine {
  id: number;
  telegram_user_id: string | number;
  telegram_username: string | null;
  name: string;
  unit: string;
  quantity: string;
  photo_file_id: string;
  photo_url?: string | null;
  description?: string | null;
  source_url?: string | null;
  category?: string | null;
  repository?: string | null;
  created_at: string;
}

export interface CreateMedicineDto {
  telegram_user_id: number | string;
  telegram_username?: string | null;
  name: string;
  unit: string;
  quantity: string;
  photo_file_id: string;
  photo_url?: string | null;
  description?: string | null;
  source_url?: string | null;
  category?: string | null;
  repository?: string | null;
}

// In-memory fallback if database is not connected yet during testing
const memoryStore: Medicine[] = [];
let memoryIdCounter = 1;

export async function findMedicineByName(name: string, unit?: string): Promise<Medicine | null> {
  const db = getDbPool();
  const cleanName = name.trim().toLowerCase();
  try {
    let sql = `SELECT * FROM medicines WHERE LOWER(TRIM(name)) = $1`;
    const params: any[] = [cleanName];

    if (unit) {
      params.push(unit.trim().toLowerCase());
      sql += ` AND LOWER(TRIM(unit)) = $2`;
    }

    sql += ` LIMIT 1`;
    const res = await db.query<Medicine>(sql, params);
    return res.rows[0] || null;
  } catch (err) {
    const found = memoryStore.find((m) => {
      const matchName = m.name.trim().toLowerCase() === cleanName;
      if (!unit) return matchName;
      return matchName && m.unit.trim().toLowerCase() === unit.trim().toLowerCase();
    });
    return found || null;
  }
}

export async function createMedicine(data: CreateMedicineDto): Promise<Medicine> {
  const db = getDbPool();
  const repoName = (data.repository || "biznesgo").trim().toLowerCase();
  try {
    const res = await db.query<Medicine>(
      `INSERT INTO medicines (
        telegram_user_id,
        telegram_username,
        name,
        unit,
        quantity,
        photo_file_id,
        photo_url,
        description,
        source_url,
        category,
        repository
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.telegram_user_id,
        data.telegram_username || null,
        data.name.trim(),
        data.unit.trim().toLowerCase(),
        data.quantity,
        data.photo_file_id,
        data.photo_url || null,
        data.description || null,
        data.source_url || null,
        data.category || null,
        repoName,
      ]
    );
    const newMed = res.rows[0];
    await recordCommit({
      message: `feat(${repoName}): add ${newMed.name} (${newMed.quantity} ${newMed.unit})`,
      author: newMed.telegram_username ? `@${newMed.telegram_username}` : String(newMed.telegram_user_id),
      folder: newMed.unit.toLowerCase(),
      details: { medicineId: newMed.id, action: "add", repository: repoName },
    }).catch(() => {});
    return newMed;
  } catch (err) {
    console.warn("Bazaga yozishda xatolik, vaqtinchalik xotiraga yozilmoqda:", err);
    const item: Medicine = {
      id: memoryIdCounter++,
      telegram_user_id: data.telegram_user_id,
      telegram_username: data.telegram_username || null,
      name: data.name,
      unit: data.unit,
      quantity: data.quantity,
      photo_file_id: data.photo_file_id,
      photo_url: data.photo_url || null,
      description: data.description || null,
      source_url: data.source_url || null,
      category: data.category || null,
      repository: repoName,
      created_at: new Date().toISOString(),
    };
    memoryStore.unshift(item);
    return item;
  }
}

export async function getAllMedicines(query?: {
  search?: string;
  unit?: string;
  repository?: string;
}): Promise<Medicine[]> {
  const db = getDbPool();
  try {
    let sql = `SELECT * FROM medicines`;
    const params: any[] = [];
    const conditions: string[] = [];

    if (query?.repository && query.repository !== "all") {
      params.push(query.repository.trim().toLowerCase());
      conditions.push(`LOWER(repository) = $${params.length}`);
    }

    if (query?.search) {
      params.push(`%${query.search.trim()}%`);
      conditions.push(`(name ILIKE $${params.length} OR unit ILIKE $${params.length} OR category ILIKE $${params.length})`);
    }

    if (query?.unit && query.unit !== "all") {
      params.push(query.unit.trim().toLowerCase());
      conditions.push(`LOWER(unit) = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(" AND ");
    }

    sql += ` ORDER BY created_at DESC`;

    const res = await db.query<Medicine>(sql, params);
    return res.rows;
  } catch (err) {
    console.warn("Bazadan o'qishda xatolik, xotiradagi ma'lumotlar qaytariladi:", err);
    let list = [...memoryStore];
    if (query?.repository && query.repository !== "all") {
      list = list.filter((m) => (m.repository || "biznesgo").toLowerCase() === query.repository?.toLowerCase());
    }
    if (query?.search) {
      const s = query.search.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(s) ||
          m.unit.toLowerCase().includes(s) ||
          (m.category && m.category.toLowerCase().includes(s))
      );
    }
    if (query?.unit && query.unit !== "all") {
      list = list.filter((m) => m.unit.toLowerCase() === query.unit?.toLowerCase());
    }
    return list;
  }
}

export async function deleteMedicine(id: number): Promise<boolean> {
  const db = getDbPool();
  try {
    const res = await db.query(`DELETE FROM medicines WHERE id = $1 RETURNING name, unit, repository`, [id]);
    const deleted = (res.rowCount ?? 0) > 0;
    if (deleted && res.rows[0]) {
      const item = res.rows[0];
      await recordCommit({
        message: `chore(${item.repository || "catalog"}): remove ${item.name} (${item.unit})`,
        author: "copilot",
        folder: item.unit ? item.unit.toLowerCase() : "root",
      }).catch(() => {});
    }
    return deleted;
  } catch (err) {
    const idx = memoryStore.findIndex((m) => m.id === id);
    if (idx !== -1) {
      memoryStore.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export async function deleteMedicinesByName(
  nameQuery: string,
  repository?: string
): Promise<{ count: number; deletedNames: string[] }> {
  const db = getDbPool();
  const clean = nameQuery.trim().toLowerCase();
  try {
    let sql = `DELETE FROM medicines WHERE LOWER(name) LIKE $1`;
    const params: any[] = [`%${clean}%`];
    if (repository && repository !== "all") {
      params.push(repository.trim().toLowerCase());
      sql += ` AND LOWER(repository) = $2`;
    }
    sql += ` RETURNING name, unit, repository`;
    const res = await db.query(sql, params);
    const count = res.rowCount ?? 0;
    const deletedNames = res.rows.map((r: any) => `${r.name} (${r.unit})`);
    if (count > 0) {
      await recordCommit({
        message: `chore: remove ${count} items matching "${nameQuery}"`,
        author: "copilot",
        folder: "root",
      }).catch(() => {});
    }
    return { count, deletedNames };
  } catch (err) {
    const toDelete = memoryStore.filter(
      (m) =>
        m.name.toLowerCase().includes(clean) &&
        (!repository || repository === "all" || (m.repository || "biznesgo").toLowerCase() === repository.toLowerCase())
    );
    for (const item of toDelete) {
      const idx = memoryStore.indexOf(item);
      if (idx !== -1) memoryStore.splice(idx, 1);
    }
    return { count: toDelete.length, deletedNames: toDelete.map((m) => `${m.name} (${m.unit})`) };
  }
}

export async function deleteMedicinesByUnit(
  unit: string,
  repository?: string
): Promise<{ count: number; unit: string }> {
  const db = getDbPool();
  const cleanUnit = unit.trim().toLowerCase();
  try {
    let sql = `DELETE FROM medicines WHERE LOWER(unit) = $1`;
    const params: any[] = [cleanUnit];
    if (repository && repository !== "all") {
      params.push(repository.trim().toLowerCase());
      sql += ` AND LOWER(repository) = $2`;
    }
    sql += ` RETURNING id`;
    const res = await db.query(sql, params);
    const count = res.rowCount ?? 0;
    if (count > 0) {
      await recordCommit({
        message: `chore: purge folder ${cleanUnit}/ (${count} items)`,
        author: "copilot",
        folder: cleanUnit,
      }).catch(() => {});
    }
    return { count, unit: cleanUnit };
  } catch (err) {
    const toDelete = memoryStore.filter(
      (m) =>
        m.unit.toLowerCase() === cleanUnit &&
        (!repository || repository === "all" || (m.repository || "biznesgo").toLowerCase() === repository.toLowerCase())
    );
    for (const item of toDelete) {
      const idx = memoryStore.indexOf(item);
      if (idx !== -1) memoryStore.splice(idx, 1);
    }
    return { count: toDelete.length, unit: cleanUnit };
  }
}

export async function clearAllMedicines(
  repository?: string
): Promise<{ count: number; repository: string }> {
  const db = getDbPool();
  const targetRepo = repository && repository !== "all" ? repository.trim().toLowerCase() : "all";
  try {
    let sql = `DELETE FROM medicines`;
    const params: any[] = [];
    if (targetRepo !== "all") {
      params.push(targetRepo);
      sql += ` WHERE LOWER(repository) = $1`;
    }
    sql += ` RETURNING id`;
    const res = await db.query(sql, params);
    const count = res.rowCount ?? 0;
    await recordCommit({
      message: `chore: reset inventory for ${targetRepo} (${count} items removed)`,
      author: "copilot",
      folder: "root",
    }).catch(() => {});
    return { count, repository: targetRepo };
  } catch (err) {
    const beforeCount = memoryStore.length;
    if (targetRepo === "all") {
      memoryStore.length = 0;
    } else {
      const remaining = memoryStore.filter(
        (m) => (m.repository || "biznesgo").toLowerCase() !== targetRepo
      );
      memoryStore.length = 0;
      memoryStore.push(...remaining);
    }
    return { count: beforeCount - memoryStore.length, repository: targetRepo };
  }
}

export async function getStats(repository?: string) {
  const medicines = await getAllMedicines({ repository });
  const total = medicines.length;
  const uniqueUsers = new Set(medicines.map((m) => m.telegram_user_id)).size;

  const byUnit: Record<string, number> = {};
  medicines.forEach((m) => {
    const u = m.unit.toLowerCase();
    byUnit[u] = (byUnit[u] || 0) + 1;
  });

  return {
    total,
    uniqueUsers,
    byUnit,
  };
}

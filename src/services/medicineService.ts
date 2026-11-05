import { getDbPool } from "../db/index.js";

export interface Medicine {
  id: number;
  telegram_user_id: string | number;
  telegram_username: string | null;
  name: string;
  unit: string;
  quantity: string;
  photo_file_id: string;
  created_at: string;
}

export interface CreateMedicineDto {
  telegram_user_id: number | string;
  telegram_username?: string | null;
  name: string;
  unit: string;
  quantity: string;
  photo_file_id: string;
}

// In-memory fallback if database is not connected yet during testing
const memoryStore: Medicine[] = [];
let memoryIdCounter = 1;

export async function createMedicine(data: CreateMedicineDto): Promise<Medicine> {
  const db = getDbPool();
  try {
    const res = await db.query<Medicine>(
      `INSERT INTO medicines (telegram_user_id, telegram_username, name, unit, quantity, photo_file_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.telegram_user_id,
        data.telegram_username || null,
        data.name,
        data.unit,
        data.quantity,
        data.photo_file_id,
      ]
    );
    return res.rows[0];
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
      created_at: new Date().toISOString(),
    };
    memoryStore.unshift(item);
    return item;
  }
}

export async function getAllMedicines(query?: {
  search?: string;
  unit?: string;
}): Promise<Medicine[]> {
  const db = getDbPool();
  try {
    let sql = `SELECT * FROM medicines`;
    const params: any[] = [];
    const conditions: string[] = [];

    if (query?.search) {
      params.push(`%${query.search}%`);
      conditions.push(`(name ILIKE $${params.length} OR unit ILIKE $${params.length})`);
    }

    if (query?.unit && query.unit !== "all") {
      params.push(query.unit);
      conditions.push(`unit = $${params.length}`);
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
    if (query?.search) {
      const s = query.search.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(s) || m.unit.toLowerCase().includes(s));
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
    const res = await db.query(`DELETE FROM medicines WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  } catch (err) {
    const idx = memoryStore.findIndex((m) => m.id === id);
    if (idx !== -1) {
      memoryStore.splice(idx, 1);
      return true;
    }
    return false;
  }
}

export async function getStats() {
  const medicines = await getAllMedicines();
  const total = medicines.length;
  const uniqueUsers = new Set(medicines.map((m) => m.telegram_user_id)).size;

  const byUnit: Record<string, number> = {};
  medicines.forEach((m) => {
    byUnit[m.unit] = (byUnit[m.unit] || 0) + 1;
  });

  return {
    total,
    uniqueUsers,
    byUnit,
  };
}


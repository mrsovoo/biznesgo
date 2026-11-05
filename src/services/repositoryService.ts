import { getDbPool } from "../db/index.js";

export interface RepositoryItem {
  id?: number;
  name: string;
  source_url?: string | null;
  description?: string | null;
  count?: number;
  created_at?: string;
}

// In-memory fallback
const memoryRepos: RepositoryItem[] = [
  { name: "biznesgo", description: "Markaziy master katalog", count: 0 },
];

export function deriveRepoNameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    // Extract clean name directly before .com / .uz / .org / etc.
    // e.g. https://tbovet.com/products -> tbovet
    // e.g. https://agroz.uz -> agroz
    // e.g. https://shop.tbovet.com -> tbovet
    const parts = host.split(".");
    let namePart = parts[0];
    if (parts.length > 2 && ["shop", "catalog", "app", "store", "m"].includes(parts[0].toLowerCase())) {
      namePart = parts[1];
    }
    return namePart.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  } catch {
    return "cloned-repo";
  }
}

export async function getAllRepositories(): Promise<RepositoryItem[]> {
  const db = getDbPool();
  try {
    const res = await db.query<RepositoryItem>(`
      SELECT 
        r.id,
        r.name,
        r.source_url,
        r.description,
        r.created_at,
        CASE 
          WHEN r.name = 'biznesgo' THEN (SELECT COUNT(*)::int FROM medicines)
          ELSE COUNT(m.id)::int 
        END as count
      FROM repositories r
      LEFT JOIN medicines m ON m.repository = r.name
      GROUP BY r.id, r.name, r.source_url, r.description, r.created_at
      ORDER BY (r.name = 'biznesgo') DESC, r.created_at DESC
    `);

    if (res.rows.length === 0) {
      return [{ name: "biznesgo", description: "Markaziy master katalog", count: 0 }];
    }
    return res.rows;
  } catch (err: any) {
    console.warn("getAllRepositories xatosi:", err.message);
    return memoryRepos;
  }
}

export async function createRepository(name: string, sourceUrl?: string, description?: string): Promise<RepositoryItem> {
  const db = getDbPool();
  const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  try {
    const res = await db.query<RepositoryItem>(`
      INSERT INTO repositories (name, source_url, description)
      VALUES ($1, $2, $3)
      ON CONFLICT (name) DO UPDATE SET source_url = EXCLUDED.source_url, description = EXCLUDED.description
      RETURNING *
    `, [cleanName, sourceUrl || null, description || null]);
    return res.rows[0];
  } catch (err: any) {
    const existing = memoryRepos.find((r) => r.name === cleanName);
    if (!existing) {
      const newRepo = { name: cleanName, source_url: sourceUrl, description, count: 0 };
      memoryRepos.push(newRepo);
      return newRepo;
    }
    return existing;
  }
}

export async function deleteRepository(name: string): Promise<boolean> {
  const db = getDbPool();
  try {
    await db.query(`DELETE FROM medicines WHERE repository = $1`, [name]);
    await db.query(`DELETE FROM repositories WHERE name = $1`, [name]);
    return true;
  } catch {
    return false;
  }
}

export async function renameRepository(oldName: string, newName: string): Promise<boolean> {
  const db = getDbPool();
  const cleanOld = oldName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  const cleanNew = newName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  if (!cleanOld || !cleanNew || cleanOld === cleanNew) return false;

  try {
    // 1. Ensure target new repo exists
    await db.query(`
      INSERT INTO repositories (name, description)
      VALUES ($1, 'Qayta nomlangan repozitoriy')
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    `, [cleanNew]);

    // 2. Transfer all medicines from old repo to new repo
    await db.query(`UPDATE medicines SET repository = $1 WHERE LOWER(repository) = $2`, [cleanNew, cleanOld]);

    // 3. Remove old repo
    await db.query(`DELETE FROM repositories WHERE LOWER(name) = $1`, [cleanOld]);

    return true;
  } catch (err: any) {
    console.warn("renameRepository xatosi:", err.message);
    const oldIdx = memoryRepos.findIndex((r) => r.name.toLowerCase() === cleanOld);
    if (oldIdx !== -1) {
      memoryRepos[oldIdx].name = cleanNew;
      return true;
    }
    return false;
  }
}


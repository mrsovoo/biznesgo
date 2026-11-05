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
    const namePart = host.split(".")[0] || "cloned-repo";
    const tld = host.split(".")[1] || "uz";
    return `${namePart}-${tld}`.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  } catch {
    return "cloned-repo";
  }
}

export async function getAllRepositories(): Promise<RepositoryItem[]> {
  const db = getDbPool();
  try {
    const res = await db.query<RepositoryItem>(`
      SELECT r.*, COUNT(m.id)::int as count
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
  if (name === "biznesgo") return false; // Prevent deleting master
  const db = getDbPool();
  try {
    await db.query(`DELETE FROM medicines WHERE repository = $1`, [name]);
    await db.query(`DELETE FROM repositories WHERE name = $1`, [name]);
    return true;
  } catch {
    return false;
  }
}


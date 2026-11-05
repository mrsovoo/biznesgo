import { getDbPool } from "../db/index.js";
import crypto from "crypto";

export interface Commit {
  id: number;
  sha: string;
  author: string;
  author_avatar?: string | null;
  message: string;
  folder?: string | null;
  details?: any;
  created_at: string;
}

export async function recordCommit(data: {
  message: string;
  author?: string;
  folder?: string;
  details?: any;
}): Promise<Commit> {
  const db = getDbPool();
  const sha = crypto.randomBytes(4).toString("hex"); // e.g. '7b4e19a'
  const author = data.author || "sohibjonsulaymonov";
  const folder = data.folder || "root";

  try {
    const res = await db.query<Commit>(
      `INSERT INTO commits (sha, message, author, folder, details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [sha, data.message, author, folder, JSON.stringify(data.details || {})]
    );
    return res.rows[0];
  } catch (err) {
    return {
      id: 1,
      sha,
      message: data.message,
      author,
      folder,
      details: data.details || {},
      created_at: new Date().toISOString(),
    };
  }
}

export async function getLatestCommit(folder?: string): Promise<Commit> {
  const db = getDbPool();
  try {
    let sql = `SELECT * FROM commits`;
    const params: any[] = [];
    if (folder && folder !== "root") {
      params.push(folder.toLowerCase());
      sql += ` WHERE LOWER(folder) = $1 OR folder = 'root'`;
    }
    sql += ` ORDER BY created_at DESC LIMIT 1`;
    const res = await db.query<Commit>(sql, params);
    if (res.rows.length > 0) return res.rows[0];
  } catch {}

  return {
    id: 1,
    sha: "8f2a1b9",
    message: folder ? `inventory: catalog updated for ${folder}/` : "feat: synchronized catalog with Neon PostgreSQL database",
    author: "sohibjonsulaymonov",
    folder: folder || "root",
    created_at: new Date().toISOString(),
  };
}

export async function getFolderCommits(): Promise<Record<string, Commit>> {
  const db = getDbPool();
  const map: Record<string, Commit> = {};
  try {
    const res = await db.query<Commit>(
      `SELECT DISTINCT ON (folder) * FROM commits ORDER BY folder, created_at DESC`
    );
    res.rows.forEach((c) => {
      if (c.folder) map[c.folder.toLowerCase()] = c;
    });
  } catch {}
  return map;
}

export async function getAllCommits(limit = 30): Promise<Commit[]> {
  const db = getDbPool();
  try {
    const res = await db.query<Commit>(
      `SELECT * FROM commits ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return res.rows;
  } catch {
    return [];
  }
}

export const createCommit = recordCommit;

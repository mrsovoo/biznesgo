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
  created_at: string;
}

export interface Stats {
  total: number;
  uniqueUsers: number;
  byUnit: Record<string, number>;
}

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

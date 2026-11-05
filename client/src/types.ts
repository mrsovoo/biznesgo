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

export interface Stats {
  total: number;
  uniqueUsers: number;
  byUnit: Record<string, number>;
}


CREATE TABLE IF NOT EXISTS medicines (
    id SERIAL PRIMARY KEY,
    telegram_user_id BIGINT NOT NULL,
    telegram_username VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    photo_file_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medicines_user_id ON medicines(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_medicines_created_at ON medicines(created_at DESC);


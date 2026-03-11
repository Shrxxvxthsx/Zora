-- Database schema
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  prompt TEXT,
  url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

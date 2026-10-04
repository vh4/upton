-- Upton PostgreSQL Schema
-- Supports both local PostgreSQL and Supabase PostgreSQL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NULL,
  download_count BIGINT DEFAULT 0,
  delete_token TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  width INT NULL,
  height INT NULL,
  duration NUMERIC NULL
);

-- Optimize queries for expiration checks, active lookups, and history
CREATE INDEX IF NOT EXISTS idx_files_expires_at ON files (expires_at);
CREATE INDEX IF NOT EXISTS idx_files_status ON files (status);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_delete_token ON files (delete_token);

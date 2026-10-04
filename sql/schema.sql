-- Upton PostgreSQL Schema
-- Supports both local PostgreSQL and Supabase PostgreSQL.
-- If using Supabase, copy and paste this entire script into your
-- Supabase Dashboard -> SQL Editor (https://supabase.com/dashboard/project/_/sql) and click RUN.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.files (
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
CREATE INDEX IF NOT EXISTS idx_files_expires_at ON public.files (expires_at);
CREATE INDEX IF NOT EXISTS idx_files_status ON public.files (status);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON public.files (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_delete_token ON public.files (delete_token);

-- Enable Row Level Security (RLS) & Policies for anonymous/public operations
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Allow public reads
CREATE POLICY "Allow public read on files" 
  ON public.files FOR SELECT 
  USING (true);

-- Allow public file record insertion
CREATE POLICY "Allow public insert on files" 
  ON public.files FOR INSERT 
  WITH CHECK (true);

-- Allow updates (e.g. download count, status)
CREATE POLICY "Allow public update on files" 
  ON public.files FOR UPDATE 
  USING (true);

-- Allow delete by token / cron
CREATE POLICY "Allow public delete on files" 
  ON public.files FOR DELETE 
  USING (true);


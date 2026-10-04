import { Pool } from 'pg';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { FileRecord, PublicFileRecord } from '@/types/file';

let pgPool: Pool | null = null;
let supabaseClient: SupabaseClient | null = null;

export function getPgPool(): Pool | null {
  const connString = process.env.DATABASE_URL;
  if (!connString) return null;

  if (!pgPool) {
    pgPool = new Pool({
      connectionString: connString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pgPool;
}

export async function closeDbPool(): Promise<void> {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
}

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return supabaseClient;
}

/**
 * Initializes table schema automatically if using direct PostgreSQL
 */
export async function ensureDbSchema(): Promise<void> {
  const pool = getPgPool();
  if (pool) {
    await pool.query(`
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
      CREATE INDEX IF NOT EXISTS idx_files_expires_at ON files (expires_at);
      CREATE INDEX IF NOT EXISTS idx_files_status ON files (status);
      CREATE INDEX IF NOT EXISTS idx_files_created_at ON files (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_files_delete_token ON files (delete_token);
    `);
  }
}

/**
 * Inserts a new file metadata record into the database.
 */
export async function insertFileRecord(
  record: Omit<FileRecord, 'id' | 'created_at' | 'download_count' | 'status'> & { id?: string }
): Promise<FileRecord> {
  const pool = getPgPool();
  const fileId = record.id || crypto.randomUUID();
  const publicUrl = record.public_url.includes('/f/')
    ? record.public_url.replace(/\/f\/[^/]+$/, `/f/${fileId}`)
    : record.public_url;

  if (pool) {
    const res = await pool.query<FileRecord>(
      `INSERT INTO files (
        id, original_name, stored_name, mime_type, file_size, file_path, public_url, expires_at, delete_token, status, width, height, duration
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', $10, $11, $12)
      RETURNING *`,
      [
        fileId,
        record.original_name,
        record.stored_name,
        record.mime_type,
        record.file_size,
        record.file_path,
        publicUrl,
        record.expires_at,
        record.delete_token,
        record.width,
        record.height,
        record.duration,
      ]
    );
    return res.rows[0];
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('files')
      .insert({
        id: fileId,
        original_name: record.original_name,
        stored_name: record.stored_name,
        mime_type: record.mime_type,
        file_size: record.file_size,
        file_path: record.file_path,
        public_url: publicUrl,
        expires_at: record.expires_at,
        delete_token: record.delete_token,
        status: 'active',
        width: record.width,
        height: record.height,
        duration: record.duration,
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(`Failed to insert into Supabase: ${error?.message || 'Unknown error'}`);
    }
    return data as FileRecord;
  }

  throw new Error('No database connection available (DATABASE_URL or SUPABASE_URL required)');
}

/**
 * Retrieves a file record by ID.
 */
export async function getFileById(id: string): Promise<FileRecord | null> {
  const pool = getPgPool();

  if (pool) {
    const res = await pool.query<FileRecord>(
      'SELECT * FROM files WHERE id = $1 LIMIT 1',
      [id]
    );
    return res.rows[0] || null;
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return (data as FileRecord) || null;
  }

  return null;
}

/**
 * Retrieves multiple file records by their IDs (e.g. for user history).
 */
export async function getFilesByIds(ids: string[]): Promise<FileRecord[]> {
  if (ids.length === 0) return [];
  const pool = getPgPool();

  if (pool) {
    const res = await pool.query<FileRecord>(
      'SELECT * FROM files WHERE id = ANY($1::uuid[]) ORDER BY created_at DESC',
      [ids]
    );
    return res.rows;
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase
      .from('files')
      .select('*')
      .in('id', ids)
      .order('created_at', { ascending: false });

    return (data as FileRecord[]) || [];
  }

  return [];
}

/**
 * Increments the download counter for a file.
 */
export async function incrementDownloadCount(id: string): Promise<number> {
  const pool = getPgPool();

  if (pool) {
    const res = await pool.query<{ download_count: number }>(
      'UPDATE files SET download_count = download_count + 1 WHERE id = $1 RETURNING download_count',
      [id]
    );
    return res.rows[0]?.download_count ?? 0;
  }

  const supabase = getSupabase();
  if (supabase) {
    const { data } = await supabase.rpc('increment_download_count', { file_id: id });
    return Number(data) || 0;
  }

  return 0;
}

/**
 * Deletes a file record if the delete token matches.
 */
export async function deleteFileRecord(id: string, deleteToken: string): Promise<boolean> {
  const pool = getPgPool();

  if (pool) {
    const res = await pool.query(
      "DELETE FROM files WHERE id = $1 AND delete_token = $2",
      [id, deleteToken]
    );
    return (res.rowCount ?? 0) > 0;
  }

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id)
      .eq('delete_token', deleteToken);

    return !error;
  }

  return false;
}

/**
 * Finds all expired file records (expires_at < NOW() and status = 'active').
 */
export async function getExpiredFiles(): Promise<FileRecord[]> {
  const pool = getPgPool();

  if (pool) {
    const res = await pool.query<FileRecord>(
      "SELECT * FROM files WHERE expires_at IS NOT NULL AND expires_at < NOW() AND status = 'active'"
    );
    return res.rows;
  }

  const supabase = getSupabase();
  if (supabase) {
    const nowIso = new Date().toISOString();
    const { data } = await supabase
      .from('files')
      .select('*')
      .not('expires_at', 'is', null)
      .lt('expires_at', nowIso)
      .eq('status', 'active');

    return (data as FileRecord[]) || [];
  }

  return [];
}

/**
 * Permanently removes expired records from database after files are unlinked.
 */
export async function deleteExpiredRecords(ids: string[]): Promise<number> {
  if (ids.length === 0) return 0;
  const pool = getPgPool();

  if (pool) {
    const res = await pool.query(
      'DELETE FROM files WHERE id = ANY($1::uuid[])',
      [ids]
    );
    return res.rowCount ?? 0;
  }

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('files').delete().in('id', ids);
    return error ? 0 : ids.length;
  }

  return 0;
}

/**
 * Transforms a database record to public safe format (no delete_token or physical path).
 */
export function toPublicFile(record: FileRecord): PublicFileRecord {
  const isImage = record.mime_type.startsWith('image/');
  const isVideo = record.mime_type.startsWith('video/');

  return {
    id: record.id,
    original_name: record.original_name,
    mime_type: record.mime_type,
    file_size: Number(record.file_size),
    public_url: record.public_url,
    created_at: record.created_at,
    expires_at: record.expires_at,
    download_count: Number(record.download_count),
    status: record.status,
    width: record.width,
    height: record.height,
    duration: record.duration,
    is_image: isImage,
    is_video: isVideo,
    raw_url: `/api/files/${record.id}/raw`,
    download_url: `/api/files/${record.id}/download`,
  };
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { generateStoredFilename, SaveFileResult } from './local';

let supabaseClient: SupabaseClient | null = null;

export function getStorageBucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || 'upton-files';
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  );
}

/**
 * Determines whether to use Supabase Storage.
 * - Always uses Supabase Storage if STORAGE_DRIVER === 'supabase'
 * - Uses local storage if STORAGE_DRIVER === 'local'
 * - On Vercel or cloud serverless environments, defaults to Supabase Storage if configured
 * - On local development laptop, defaults to local folder ./file
 */
export function isSupabaseStorageEnabled(): boolean {
  if (process.env.STORAGE_DRIVER === 'supabase') return true;
  if (process.env.STORAGE_DRIVER === 'local') return false;

  // On Vercel or AWS Lambda, local disk is ephemeral (/tmp)
  if (
    (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) &&
    isSupabaseConfigured()
  ) {
    return true;
  }

  return false;
}

export function getSupabaseStorageClient(): SupabaseClient | null {
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
 * Parses a stored file path to detect if it's on Supabase Storage or local disk.
 * Supports "supabase://bucket/path", "supabase:bucket/path", or standard "year/month/name".
 */
export function parseStoragePath(rawPath: string): {
  isSupabase: boolean;
  bucket: string;
  key: string;
} {
  const defaultBucket = getStorageBucketName();

  if (rawPath.startsWith('supabase://')) {
    const without = rawPath.slice('supabase://'.length);
    const slashIdx = without.indexOf('/');
    if (slashIdx !== -1) {
      return {
        isSupabase: true,
        bucket: without.substring(0, slashIdx),
        key: without.substring(slashIdx + 1),
      };
    }
    return { isSupabase: true, bucket: defaultBucket, key: without };
  }

  if (rawPath.startsWith('supabase:')) {
    const without = rawPath.slice('supabase:'.length);
    const slashIdx = without.indexOf('/');
    if (slashIdx !== -1) {
      const firstSegment = without.substring(0, slashIdx);
      // If first segment is 4-digit year (e.g. 2026), it's a date partition in the default bucket
      if (/^\d{4}$/.test(firstSegment)) {
        return {
          isSupabase: true,
          bucket: defaultBucket,
          key: without,
        };
      }
      return {
        isSupabase: true,
        bucket: firstSegment,
        key: without.substring(slashIdx + 1),
      };
    }
    return { isSupabase: true, bucket: defaultBucket, key: without };
  }

  return {
    isSupabase: false,
    bucket: defaultBucket,
    key: rawPath,
  };
}

/**
 * Ensures bucket exists in Supabase Storage.
 * Gracefully ignores if permissions prevent bucket inspection/creation.
 */
export async function ensureSupabaseBucket(): Promise<boolean> {
  const client = getSupabaseStorageClient();
  if (!client) return false;

  const bucket = getStorageBucketName();
  try {
    const { data: bucketData, error: getErr } = await client.storage.getBucket(bucket);
    if (bucketData && !getErr) return true;

    const { error: createErr } = await client.storage.createBucket(bucket, {
      public: true,
    });
    if (!createErr) {
      console.log(`[storage:supabase] Bucket '${bucket}' created successfully.`);
      return true;
    }
  } catch (err) {
    console.warn('[storage:supabase] Bucket check/create skipped:', err);
  }
  return false;
}

/**
 * Saves a file buffer to the Supabase Storage bucket in year/month partition.
 */
export async function saveSupabaseFile(
  buffer: Buffer,
  extension: string,
  mimeType: string
): Promise<SaveFileResult> {
  const client = getSupabaseStorageClient();
  if (!client) {
    throw new Error('Supabase client is not configured (SUPABASE_URL and key required).');
  }

  const bucket = getStorageBucketName();
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const storedName = generateStoredFilename(extension);
  const storageKey = `${year}/${month}/${storedName}`;

  const { error } = await client.storage
    .from(bucket)
    .upload(storageKey, buffer, {
      contentType: mimeType || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    const msg = error.message || '';
    if (msg.includes('Bucket not found') || (error as any).statusCode === '404') {
      throw new Error(
        `Bucket '${bucket}' belum dibuat di Supabase Storage. Silakan buat bucket '${bucket}' (Public) di Supabase Dashboard (Storage > New Bucket) atau jalankan SQL dari sql/schema.sql.`
      );
    }
    if (msg.includes('violates row-level security policy') || (error as any).statusCode === '403') {
      throw new Error(
        `Akses upload ke Supabase Storage ditolak (RLS). Pastikan Anda telah menjalankan policy SQL dari sql/schema.sql atau tambahkan SUPABASE_SERVICE_ROLE_KEY di Environment Variables Vercel.`
      );
    }
    throw new Error(`Gagal upload file ke Supabase Storage: ${msg}`);
  }

  const canonicalPath = `supabase://${bucket}/${storageKey}`;

  return {
    storedName,
    relativePath: canonicalPath,
    absolutePath: canonicalPath,
    fileSize: buffer.length,
  };
}

/**
 * Deletes a file from Supabase Storage bucket.
 */
export async function deleteSupabaseFile(filePath: string): Promise<boolean> {
  const client = getSupabaseStorageClient();
  if (!client) return false;

  const parsed = parseStoragePath(filePath);
  const bucket = parsed.bucket;
  const key = parsed.key;

  try {
    const { error } = await client.storage.from(bucket).remove([key]);
    if (error) {
      console.warn(`[storage:supabase] Failed to delete ${key}:`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[storage:supabase] Exception deleting ${key}:`, err);
    return false;
  }
}

/**
 * Checks file stat/existence in Supabase Storage.
 */
export async function getSupabaseFileStat(
  filePath: string
): Promise<{ exists: boolean; size?: number } | null> {
  const client = getSupabaseStorageClient();
  if (!client) return null;

  const parsed = parseStoragePath(filePath);
  const bucket = parsed.bucket;
  const key = parsed.key;

  try {
    // Check via signed URL generation (fastest test of existence across public/private)
    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUrl(key, 60);

    if (!error && data?.signedUrl) {
      return { exists: true };
    }

    if (error && (error.message?.includes('not found') || (error as any)?.code === 'NoSuchKey' || (error as any)?.statusCode === '404')) {
      return null;
    }

    // Fallback: list directory
    const parts = key.split('/');
    const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
    const filename = parts[parts.length - 1];

    const { data: listData } = await client.storage
      .from(bucket)
      .list(folder, { search: filename, limit: 1 });

    const match = listData?.find((item) => item.name === filename);
    if (match) {
      return {
        exists: true,
        size: (match.metadata as any)?.size,
      };
    }

    return null;
  } catch (err) {
    console.warn(`[storage:supabase] Error checking file stat for ${key}:`, err);
    return null;
  }
}

/**
 * Generates public or signed URL for preview or download.
 */
export async function getSupabaseFileUrl(
  filePath: string,
  options?: { download?: string }
): Promise<string | null> {
  const client = getSupabaseStorageClient();
  if (!client) return null;

  const parsed = parseStoragePath(filePath);
  const bucket = parsed.bucket;
  const key = parsed.key;

  // 1. Try public URL
  const { data } = client.storage.from(bucket).getPublicUrl(key, {
    download: options?.download || false,
  });

  if (data?.publicUrl) {
    return data.publicUrl;
  }

  // 2. If bucket is private, use signed URL
  const { data: signedData } = await client.storage
    .from(bucket)
    .createSignedUrl(key, 3600, {
      download: options?.download || undefined,
    });

  return signedData?.signedUrl || null;
}

/**
 * Deletes a batch of files from Supabase Storage bucket.
 */
export async function deleteSupabaseFilesBatch(paths: string[]): Promise<number> {
  const client = getSupabaseStorageClient();
  if (!client || paths.length === 0) return 0;

  const bucket = getStorageBucketName();
  const keys = paths.map((p) => parseStoragePath(p).key);

  let deletedCount = 0;
  for (let i = 0; i < keys.length; i += 100) {
    const chunk = keys.slice(i, i + 100);
    try {
      const { error } = await client.storage.from(bucket).remove(chunk);
      if (!error) {
        deletedCount += chunk.length;
      }
    } catch (err) {
      console.warn('[storage:supabase] Error in batch delete:', err);
    }
  }

  return deletedCount;
}

/**
 * Completely empties all objects in the Supabase Storage bucket recursively.
 */
export async function emptySupabaseBucket(): Promise<number> {
  const client = getSupabaseStorageClient();
  if (!client) return 0;

  const supabase = client;
  const bucket = getStorageBucketName();
  let totalDeleted = 0;

  async function cleanFolder(folder: string = ''): Promise<void> {
    const { data: list, error } = await supabase.storage
      .from(bucket)
      .list(folder, { limit: 100 });

    if (error || !list || list.length === 0) return;

    const filesToDelete: string[] = [];
    for (const item of list) {
      const fullPath = folder ? `${folder}/${item.name}` : item.name;
      if (!item.id && !item.metadata) {
        // Subfolder
        await cleanFolder(fullPath);
      } else {
        filesToDelete.push(fullPath);
      }
    }

    if (filesToDelete.length > 0) {
      const { error: delErr } = await supabase.storage.from(bucket).remove(filesToDelete);
      if (!delErr) {
        totalDeleted += filesToDelete.length;
      }
    }
  }

  try {
    await cleanFolder('');
  } catch (err) {
    console.warn('[storage:supabase] Error emptying bucket:', err);
  }

  return totalDeleted;
}

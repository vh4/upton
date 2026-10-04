/**
 * Storage capacity constants and helper utilities for UP-TON.
 * Maximum storage is capped at 1 GB.
 */

// 1 GB in bytes = 1024 * 1024 * 1024 = 1,073,741,824 bytes
export const DEFAULT_MAX_STORAGE_BYTES = 1024 * 1024 * 1024;

export function getMaxStorageBytes(): number {
  if (process.env.MAX_STORAGE_MB) {
    const mb = parseInt(process.env.MAX_STORAGE_MB, 10);
    if (!isNaN(mb) && mb > 0) {
      return mb * 1024 * 1024;
    }
  }
  if (process.env.MAX_STORAGE_BYTES) {
    const bytes = parseInt(process.env.MAX_STORAGE_BYTES, 10);
    if (!isNaN(bytes) && bytes > 0) {
      return bytes;
    }
  }
  return DEFAULT_MAX_STORAGE_BYTES;
}

export function formatStoragePercent(usedBytes: number, maxBytes: number): number {
  if (maxBytes <= 0) return 0;
  const pct = (usedBytes / maxBytes) * 100;
  return Math.min(100, Math.round(pct * 10) / 10);
}

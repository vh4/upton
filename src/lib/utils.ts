import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isVideoMime(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

export function truncateFilename(filename: string, maxLen = 32): string {
  if (filename.length <= maxLen) return filename;
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot < filename.length - 8) {
    return `${filename.slice(0, maxLen - 3)}...`;
  }
  const ext = filename.slice(lastDot);
  const base = filename.slice(0, lastDot);
  const remaining = maxLen - ext.length - 3;
  return `${base.slice(0, Math.max(1, remaining))}...${ext}`;
}

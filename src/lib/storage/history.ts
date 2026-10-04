import { StoredUploadHistoryItem } from '@/types/file';

const HISTORY_KEY = 'upton_upload_history_v1';

export function getLocalUploadHistory(): StoredUploadHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalUploadHistory(items: StoredUploadHistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save upload history to localStorage', err);
  }
}

export function addLocalUploadHistoryItem(item: StoredUploadHistoryItem): void {
  const current = getLocalUploadHistory();
  // Filter out any existing item with same id
  const filtered = current.filter((x) => x.id !== item.id);
  // Put newest at the front
  filtered.unshift(item);
  // Keep maximum 100 items
  saveLocalUploadHistory(filtered.slice(0, 100));
}

export function removeLocalUploadHistoryItem(id: string): void {
  const current = getLocalUploadHistory();
  const filtered = current.filter((x) => x.id !== id);
  saveLocalUploadHistory(filtered);
}

export function clearLocalUploadHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

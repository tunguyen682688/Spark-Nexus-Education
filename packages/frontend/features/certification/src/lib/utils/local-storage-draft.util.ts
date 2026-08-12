const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export function getStorageKey(id: string, prefix: string): string {
  return `${prefix}-${id}`;
}

export function saveDraftToStorage<T>(id: string, prefix: string, data: T): void {
  try {
    const payload = { data, savedAt: Date.now() };
    localStorage.setItem(getStorageKey(id, prefix), JSON.stringify(payload));
  } catch { /* quota exceeded — ignore */ }
}

export function loadDraftFromStorage<T>(id: string, prefix: string): T | null {
  try {
    const raw = localStorage.getItem(getStorageKey(id, prefix));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.savedAt || Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      localStorage.removeItem(getStorageKey(id, prefix));
      return null;
    }
    return parsed.data as T;
  } catch {
    return null;
  }
}

export function clearDraftFromStorage(id: string, prefix: string): void {
  try {
    localStorage.removeItem(getStorageKey(id, prefix));
  } catch { /* ignore */ }
}

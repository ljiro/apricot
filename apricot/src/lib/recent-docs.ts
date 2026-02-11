const RECENT_STORAGE_KEY = "apricot-recent-docs";
const MAX_RECENT = 8;

export type RecentDoc = { id: string; title: string };

export function getRecentDocs(): RecentDoc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentDoc[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

export function addRecentDoc(id: string, title: string) {
  const recent = getRecentDocs().filter((d) => d.id !== id);
  recent.unshift({ id, title: title || "Untitled document" });
  try {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // ignore
  }
}

export function removeRecentDoc(id: string) {
  const recent = getRecentDocs().filter((d) => d.id !== id);
  try {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent));
  } catch {
    // ignore
  }
}

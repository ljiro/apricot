const CONTENT_STORAGE_PREFIX = "apricot-doc-content-";

export type DocumentContentJson = Record<string, unknown>;

export function saveDocumentContent(documentId: string, json: DocumentContentJson): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${CONTENT_STORAGE_PREFIX}${documentId}`, JSON.stringify(json));
  } catch {
    // ignore quota or other errors
  }
}

export function getDocumentContent(documentId: string): DocumentContentJson | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CONTENT_STORAGE_PREFIX}${documentId}`);
    if (!raw) return null;
    const json = JSON.parse(raw) as DocumentContentJson;
    return json && typeof json === "object" ? json : null;
  } catch {
    return null;
  }
}

export function deleteDocumentContent(documentId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${CONTENT_STORAGE_PREFIX}${documentId}`);
  } catch {
    // ignore
  }
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Editor } from "./editor";
import { Toolbar } from "./toolbar";
import { MenuBar } from "./menu-bar";
import { AiChatPanel } from "./ai-chat-panel";
import { addRecentDoc } from "@/lib/recent-docs";
import { FileTextIcon } from "lucide-react";

const TITLE_STORAGE_KEY = "apricot-doc-title";

function getStoredTitle(documentId: string): string {
  if (typeof window === "undefined") return "Untitled document";
  try {
    const raw = localStorage.getItem(`${TITLE_STORAGE_KEY}-${documentId}`);
    return raw ?? "Untitled document";
  } catch {
    return "Untitled document";
  }
}

export function DocumentShell({
  documentId,
  template,
}: {
  documentId: string;
  template?: string;
}) {
  const [title, setTitle] = useState("Untitled document");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    setTitle(getStoredTitle(documentId));
  }, [documentId]);

  useEffect(() => {
    addRecentDoc(documentId, title);
  }, [documentId, title]);

  const saveTitle = useCallback(
    (value: string) => {
      const trimmed = value.trim() || "Untitled document";
      setTitle(trimmed);
      try {
        localStorage.setItem(`${TITLE_STORAGE_KEY}-${documentId}`, trimmed);
      } catch {
        // ignore
      }
    },
    [documentId]
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Top bar - Google Docs: logo + title */}
      <header className="flex items-center gap-3 h-12 pl-2 pr-4 border-b border-[#e8eaed] bg-white shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#5f6368] hover:text-[#3c4043] p-2 -ml-2 rounded-lg hover:bg-[#f1f3f4] transition-colors"
        >
          <FileTextIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Apricot</span>
        </Link>
        <div className="flex-1 min-w-0 flex items-center max-w-2xl">
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                saveTitle(title);
                setIsEditingTitle(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveTitle(title);
                  setIsEditingTitle(false);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-lg text-[#3c4043] px-2 py-1 -ml-2 rounded hover:bg-[#f1f3f4] focus:bg-white focus:ring-1 focus:ring-[#dadce0] focus:ring-inset"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="text-left flex-1 min-w-0 truncate text-lg text-[#3c4043] px-2 py-1 -ml-2 rounded hover:bg-[#f1f3f4] transition-colors"
            >
              {title}
            </button>
          )}
        </div>
      </header>

      <MenuBar documentId={documentId} />
      <Toolbar />
      <div className="flex-1 min-h-0 relative">
        <Editor documentId={documentId} template={template} />
        <AiChatPanel />
      </div>
    </div>
  );
}

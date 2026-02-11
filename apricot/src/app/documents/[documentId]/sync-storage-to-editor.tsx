"use client";

import { useEffect } from "react";
import { useStorage } from "@/lib/liveblocks.config";
import { useEditorStore } from "@/app/store/use-editor-store";

/**
 * Syncs Liveblocks storage (suggestions, highlightRange) to the editor so
 * suggestion highlights and the inline selection highlight are visible to all users.
 */
export function SyncStorageToEditor() {
  const editor = useEditorStore((s) => s.editor);
  const suggestions = useStorage((root) => root?.suggestions ?? null);
  const highlightRange = useStorage((root) => root?.highlightRange ?? null);

  useEffect(() => {
    if (!editor) return;
    const list = suggestions;
    const arr = list != null ? Array.from(list).map((item: { id: string; from: number; to: number }) => ({ id: item.id, from: item.from, to: item.to })) : [];
    editor.commands.setSuggestionRanges?.(arr);
  }, [editor, suggestions]);

  useEffect(() => {
    if (!editor) return;
    const range = highlightRange;
    if (range && typeof range.from === "number" && typeof range.to === "number" && range.from !== range.to && range.from >= 0) {
      editor.commands.setHighlightRange?.(range.from, range.to);
    } else {
      editor.commands.clearHighlightRange?.();
    }
  }, [editor, highlightRange]);

  return null;
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useEditorStore } from "@/app/store/use-editor-store";
import { useStorage, useMutation } from "@/lib/liveblocks.config";
import { markdownToHtml } from "@/lib/markdown-to-html";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import type { SuggestionItem } from "@/lib/liveblocks.config";

/**
 * Renders suggestion cards at the edge of the paper (shared via Liveblocks so all users see them).
 */
export function SuggestionCardsOverlay() {
  const editor = useEditorStore((s) => s.editor);
  const suggestionsFromStorage = useStorage((root) => root?.suggestions ?? null);
  const documentSuggestions: SuggestionItem[] = suggestionsFromStorage != null ? Array.from(suggestionsFromStorage) : [];
  const [, setTick] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  const removeSuggestion = useMutation(({ storage }, id: string) => {
    const list = storage.get("suggestions");
    const index = list.findIndex((item) => item.get("id") === id);
    if (index >= 0) list.delete(index);
  }, []);

  // After mount, re-render so overlayRef.current is set and card positions are correct
  useEffect(() => {
    const t = setTimeout(() => setTick((n) => n + 1), 0);
    return () => clearTimeout(t);
  }, [documentSuggestions.length]);

  // Re-position on scroll and resize
  useEffect(() => {
    if (!editor || documentSuggestions.length === 0) return;
    const forceUpdate = () => setTick((t) => t + 1);
    const scrollEl = editor.view.dom.closest(".overflow-x-auto");
    scrollEl?.addEventListener("scroll", forceUpdate);
    window.addEventListener("resize", forceUpdate);
    return () => {
      scrollEl?.removeEventListener("scroll", forceUpdate);
      window.removeEventListener("resize", forceUpdate);
    };
  }, [editor, documentSuggestions.length]);

  if (!editor || documentSuggestions.length === 0) return null;

  const view = editor.view;
  const viewDom = view.dom;
  const overlayRect = overlayRef.current?.getBoundingClientRect();
  const viewRect = viewDom.getBoundingClientRect();

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none absolute inset-0 rounded-sm overflow-visible"
      aria-hidden
    >
      <div className="pointer-events-auto relative h-0 w-0">
        {documentSuggestions.map((sug) => {
          try {
            const coordsFrom = view.coordsAtPos(sug.from);
            if (!coordsFrom || !overlayRect) return null;
            const gap = 8;
            const left = overlayRect.width + gap;
            const top = viewRect.top + coordsFrom.top - overlayRect.top;
            return (
              <div
                key={sug.id}
                className="absolute z-10 w-72 rounded-lg border border-[#e4e4e7] bg-white p-2 text-xs shadow-lg"
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                }}
              >
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[#71717a] font-medium">Original: </span>
                    <span className="line-through text-[#a1a1aa] bg-[#fef2f2]/50 px-0.5 rounded">
                      {sug.originalText.slice(0, 60)}
                      {sug.originalText.length > 60 ? "…" : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#71717a] font-medium">Suggested: </span>
                    <span className="text-[#0d9488] bg-[#ccfbf1]/50 px-0.5 rounded">
                      {sug.suggestedContent.slice(0, 60)}
                      {sug.suggestedContent.length > 60 ? "…" : ""}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const html = markdownToHtml(sug.suggestedContent);
                        editor.chain().focus().insertContentAt({ from: sug.from, to: sug.to }, html).run();
                        editor.commands.clearHighlightRange?.();
                        editor.commands.removeSuggestionRange?.(sug.id);
                        removeSuggestion(sug.id);
                        toast.success("Suggestion accepted");
                      } catch (err) {
                        toast.error("Could not apply (document may have changed)");
                      }
                    }}
                    className="flex items-center gap-1 rounded-md bg-[#0d9488] px-2 py-1 text-white hover:bg-[#0f766e]"
                  >
                    <Check className="w-3 h-3" />
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      editor.commands.removeSuggestionRange?.(sug.id);
                      removeSuggestion(sug.id);
                      toast.success("Suggestion rejected");
                    }}
                    className="flex items-center gap-1 rounded-md border border-[#e4e4e7] bg-white px-2 py-1 text-[#71717a] hover:bg-[#f4f4f5]"
                  >
                    <X className="w-3 h-3" />
                    Reject
                  </button>
                </div>
              </div>
            );
          } catch {
            return null;
          }
        })}
      </div>
    </div>
  );
}

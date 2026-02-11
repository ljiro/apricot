import { create } from "zustand";
import { type Editor } from "@tiptap/react";
import type { PaperFormatId } from "@/app/documents/[documentId]/paper-format";

export type PendingSuggestion = {
  id: string;
  from: number;
  to: number;
  originalText: string;
  suggestedContent: string;
};

interface EditorState {
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;
  /** When true, selecting text then focusing AI bubble captures selection for "inline text selection" */
  inlineTextSelectionMode: boolean;
  setInlineTextSelectionMode: (value: boolean) => void;
  /** Document-level suggestions shown next to the text (not in chat) */
  documentSuggestions: PendingSuggestion[];
  addDocumentSuggestion: (suggestion: PendingSuggestion) => void;
  removeDocumentSuggestion: (id: string) => void;
  /** Paper size: a4, letter, legal */
  pageFormat: PaperFormatId;
  setPageFormat: (format: PaperFormatId) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  editor: null,
  setEditor: (editor) => set({ editor }),
  inlineTextSelectionMode: false,
  setInlineTextSelectionMode: (value) => set({ inlineTextSelectionMode: value }),
  documentSuggestions: [],
  addDocumentSuggestion: (suggestion) =>
    set((s) => ({ documentSuggestions: [...s.documentSuggestions, suggestion] })),
  removeDocumentSuggestion: (id) =>
    set((s) => ({
      documentSuggestions: s.documentSuggestions.filter((p) => p.id !== id),
    })),
  pageFormat: "a4",
  setPageFormat: (pageFormat) => set({ pageFormat }),
}));
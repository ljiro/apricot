"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import Underline from "@tiptap/extension-underline";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { HighlightSelectionExtension } from "./highlight-selection-extension";
import { SuggestionRangesExtension } from "./suggestion-ranges-extension";
import { SuggestionCardsOverlay } from "./suggestion-cards-overlay";
import { SyncStorageToEditor } from "./sync-storage-to-editor";
import { DocumentWithPages } from "./document-with-pages-extension";
import { PageNode, getDefaultDoc } from "./page-node-extension";
import { useMemo, useEffect, useRef, useState } from "react";
import { useRoom, useSelf } from "@/lib/liveblocks.config";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useEditorStore } from "@/app/store/use-editor-store";
import { saveDocumentContent, getDocumentContent } from "@/lib/document-storage";
import { PAPER_FORMATS, PAGE_GAP_PX } from "./paper-format";

function isEmptyDoc(json: { content?: unknown[] }): boolean {
  if (!json.content || !Array.isArray(json.content)) return true;
  if (json.content.length === 0) return true;
  const first = json.content[0] as { type?: string; content?: unknown[] } | undefined;
  if (first?.type === "page") {
    const pageContent = first.content;
    if (!pageContent || !Array.isArray(pageContent) || pageContent.length === 0) return true;
    const only = pageContent[0] as { type?: string; content?: unknown[] } | undefined;
    return pageContent.length === 1 && only?.type === "paragraph" && !only.content?.length;
  }
  if (json.content.length === 1 && first?.type === "paragraph") {
    return !first.content || first.content.length === 0;
  }
  return false;
}

function migrateToPageDoc(json: { type?: string; content?: unknown[] }): { type: string; content: unknown[] } {
  if (!json.content || !Array.isArray(json.content)) return getDefaultDoc();
  const first = json.content[0] as { type?: string } | undefined;
  if (first?.type === "page") return json as { type: string; content: unknown[] };
  const blocks: unknown[] = [];
  let currentPage: unknown[] = [];
  for (const node of json.content as { type?: string }[]) {
    if (node.type === "pageBreak") {
      if (currentPage.length) blocks.push({ type: "page", content: currentPage });
      currentPage = [];
    } else {
      currentPage.push(node);
    }
  }
  if (currentPage.length) blocks.push({ type: "page", content: currentPage });
  if (blocks.length === 0) return getDefaultDoc();
  return { type: "doc", content: blocks };
}

const AUTO_SAVE_MS = 2000;

function CollaborativeEditorInner({
  documentId,
  template,
}: {
  documentId: string;
  template?: string;
}) {
  const room = useRoom();
  const userInfo = useSelf((me) => me?.info);
  const { setEditor, pageFormat } = useEditorStore();
  const paper = PAPER_FORMATS[pageFormat];
  const templateAppliedRef = useRef(false);
  const restoredFromStorageRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [totalPageMinHeight, setTotalPageMinHeight] = useState(paper.heightPx);

  const yProvider = useMemo(() => getYjsProviderForRoom(room), [room]);
  const yDoc = useMemo(() => yProvider.getYDoc(), [yProvider]);

  const cursorUser = useMemo(
    () =>
      userInfo
        ? { name: userInfo.name, color: userInfo.color }
        : { name: "Anonymous", color: "#94a3b8" },
    [userInfo]
  );

  const editor = useEditor({
    content: getDefaultDoc(),
    onCreate({ editor }) {
      setEditor(editor);
    },
    onDestroy() {
      setEditor(null);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    },
    onUpdate({ editor }) {
      setEditor(editor);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        try {
          saveDocumentContent(documentId, editor.getJSON() as Record<string, unknown>);
        } catch {
          // ignore
        }
        saveTimeoutRef.current = null;
      }, AUTO_SAVE_MS);
    },
    onSelectionUpdate({ editor }) {
      setEditor(editor);
    },
    onTransaction({ editor }) {
      setEditor(editor);
    },
    onFocus({ editor }) {
      setEditor(editor);
    },
    onBlur({ editor }) {
      setEditor(editor);
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "focus:outline-none print:border-0 block cursor-text editor-content-area editor-doc-pages",
      },
    },
    extensions: [
      StarterKit.configure({
        history: false,
        document: false,
      }),
      DocumentWithPages,
      PageNode,
      Collaboration.configure({
        document: yDoc,
      }),
      CollaborationCursor.configure({
        provider: yProvider,
        user: cursorUser,
      }),
      Image,
      ImageResize,
      Underline,
      Table,
      TableCell,
      TableHeader,
      TableRow,
      TaskItem.configure({ nested: true }),
      TaskList,
      HighlightSelectionExtension,
      SuggestionRangesExtension,
    ],
  });

  // When cursor user info loads (e.g. after auth), update the collaboration cursor
  useEffect(() => {
    if (!editor || !userInfo) return;
    try {
      editor.commands.updateUser?.({
        name: userInfo.name,
        color: userInfo.color,
      });
    } catch {
      // ignore
    }
  }, [editor, userInfo]);

  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // After sync: wait for editor to receive synced state, then apply template or restore from localStorage only if doc is still empty
  useEffect(() => {
    if (!editor) return;
    const runWhenReady = () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        syncTimeoutRef.current = null;
        try {
          const json = editor.getJSON();
          if (template && !templateAppliedRef.current) {
            if (isEmptyDoc(json)) {
              editor.commands.setContent(getDefaultDoc(), false);
              templateAppliedRef.current = true;
              return;
            }
          }
          if (!templateAppliedRef.current && isEmptyDoc(json) && !restoredFromStorageRef.current) {
            const saved = getDocumentContent(documentId) as { content?: unknown[] } | null;
            if (saved && !isEmptyDoc(saved)) {
              editor.commands.setContent(migrateToPageDoc(saved), false);
              restoredFromStorageRef.current = true;
            }
          }
        } catch {
          // ignore
        }
      }, 150);
    };
    const onSync = (synced: boolean) => {
      if (synced) runWhenReady();
    };
    if (yProvider.synced) {
      runWhenReady();
    } else {
      yProvider.on("sync", onSync);
    }
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
      yProvider.off("sync", onSync);
    };
  }, [editor, template, yProvider, documentId]);

  // Apply paper dimensions and full-page min-height so when cursor is on the next page, that page loads entirely (A4/Letter/Legal)
  useEffect(() => {
    if (!editor?.view?.dom) return;
    const el = editor.view.dom as HTMLElement;
    const pageHeight = paper.heightPx;
    const gap = PAGE_GAP_PX;
    el.style.setProperty("--editor-page-width", `${paper.widthPx}px`);
    el.style.setProperty("--editor-page-height", `${pageHeight}px`);
    el.style.setProperty("--editor-page-gap", `${gap}px`);
    const updateMinHeight = () => {
      const doc = editor.state.doc;
      const pageType = doc.type.schema.nodes.page;
      let pageCount = 0;
      doc.descendants((node) => {
        if (node.type === pageType) pageCount++;
        return true;
      });
      if (pageCount === 0) pageCount = 1;
      const totalMinHeight =
        pageCount * pageHeight + (pageCount - 1) * gap;
      el.style.minHeight = `${totalMinHeight}px`;
      setTotalPageMinHeight(totalMinHeight);
    };
    updateMinHeight();
    editor.on("update", updateMinHeight);
    return () => editor.off("update", updateMinHeight);
  }, [editor, paper.widthPx, paper.heightPx]);

  useEffect(() => {
    const id = "apricot-print-page-size";
    let styleEl = document.getElementById(id) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = id;
      styleEl.setAttribute("media", "print");
      document.head.appendChild(styleEl);
    }
    const size =
      pageFormat === "letter"
        ? "215.9mm 279.4mm"
        : pageFormat === "legal"
          ? "215.9mm 355.6mm"
          : "210mm 297mm";
    styleEl.textContent = `@page { size: ${size}; margin: 15mm; }`;
    return () => {
      styleEl?.remove();
    };
  }, [pageFormat]);

  return (
    <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto bg-[#f8f9fa] px-4 print:p-0 print:bg-white print:overflow-visible">
      <div
        className="min-w-max flex justify-center py-8 print:py-0 mx-auto print:w-full print:min-w-0 editor-paper-wrapper"
        data-paper-format={pageFormat}
        style={{
          width: paper.widthPx,
          ["--editor-page-height" as string]: `${paper.heightPx}px`,
          ["--editor-page-width" as string]: `${paper.widthPx}px`,
          ["--editor-page-gap" as string]: `${PAGE_GAP_PX}px`,
        }}
      >
        <div
          className="relative shadow-[0_1px_3px_rgba(60,64,67,0.3)] rounded-sm bg-white editor-paper"
          style={{ minHeight: totalPageMinHeight }}
        >
          <EditorContent editor={editor} />
          <SyncStorageToEditor />
          <SuggestionCardsOverlay />
        </div>
      </div>
    </div>
  );
}

export function Editor({
  documentId,
  template,
}: {
  documentId: string;
  template?: string;
}) {
  return (
    <CollaborativeEditorInner documentId={documentId} template={template} />
  );
}

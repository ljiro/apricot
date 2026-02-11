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
import { useMemo, useEffect, useRef } from "react";
import { useRoom, useSelf } from "@/lib/liveblocks.config";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useEditorStore } from "@/app/store/use-editor-store";
import { saveDocumentContent, getDocumentContent } from "@/lib/document-storage";
import { TEMPLATE_CONTENT } from "./templates";

function isEmptyDoc(json: { content?: unknown[] }): boolean {
  if (!json.content || !Array.isArray(json.content)) return true;
  if (json.content.length === 0) return true;
  const first = json.content[0] as { type?: string; content?: unknown[] } | undefined;
  if (json.content.length === 1 && first?.type === "paragraph") {
    return !first.content || first.content.length === 0;
  }
  return false;
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
  const { setEditor } = useEditorStore();
  const templateAppliedRef = useRef(false);
  const restoredFromStorageRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        style: "padding-left: 56px; padding-right: 56px;",
        class:
          "focus:outline-none print:border-0 bg-white flex flex-col min-h-[1123px] w-[794px] pt-10 pr-14 pb-10 cursor-text rounded-sm",
      },
    },
    extensions: [
      StarterKit.configure({
        history: false,
      }),
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
            const html = TEMPLATE_CONTENT[template] ?? TEMPLATE_CONTENT.blank;
            if (isEmptyDoc(json)) {
              editor.commands.setContent(html, false);
              templateAppliedRef.current = true;
              return;
            }
          }
          if (!templateAppliedRef.current && isEmptyDoc(json) && !restoredFromStorageRef.current) {
            const saved = getDocumentContent(documentId);
            if (saved && !isEmptyDoc(saved as { content?: unknown[] })) {
              editor.commands.setContent(saved, false);
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

  return (
    <div className="flex-1 overflow-x-auto bg-[#f8f9fa] px-4 print:p-0 print:bg-white print:overflow-visible">
      <div className="min-w-max flex justify-center w-[794px] py-8 print:py-0 mx-auto print:w-full print:min-w-0">
        <div className="relative shadow-[0_1px_3px_rgba(60,64,67,0.3)] rounded-sm bg-white">
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

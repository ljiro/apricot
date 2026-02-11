"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEditorStore } from "@/app/store/use-editor-store";
import { saveDocumentContent, deleteDocumentContent } from "@/lib/document-storage";
import { removeRecentDoc } from "@/lib/recent-docs";
import { toast } from "sonner";

const MENU_ITEMS = [
  "File",
  "Edit",
  "View",
  "Insert",
  "Format",
  "Tools",
  "Help",
] as const;

const TITLE_STORAGE_KEY = "apricot-doc-title";

export function MenuBar({ documentId }: { documentId: string }) {
  const router = useRouter();
  const { editor } = useEditorStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSave = () => {
    if (!editor) return;
    try {
      saveDocumentContent(documentId, editor.getJSON() as Record<string, unknown>);
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleDeleteDocument = async () => {
    try {
      const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      deleteDocumentContent(documentId);
      try {
        localStorage.removeItem(`${TITLE_STORAGE_KEY}-${documentId}`);
      } catch {
        // ignore
      }
      removeRecentDoc(documentId);
      toast.success("Document deleted");
      router.push("/");
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="h-8 flex items-center gap-0.5 px-1 bg-white border-b border-[#e8eaed] shrink-0">
      {MENU_ITEMS.map((label) => (
        <DropdownMenu key={label}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="px-3 py-1 text-[13px] text-[#3c4043] rounded hover:bg-[#f1f3f4] focus:bg-[#f1f3f4] focus:outline-none data-[state=open]:bg-[#f1f3f4] transition-colors"
            >
              {label}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[180px] rounded-lg shadow-lg border-[#dadce0]">
            {label === "File" && (
              <>
                <DropdownMenuItem asChild>
                  <Link href="/" className="cursor-pointer">New</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/documents" className="cursor-pointer">Open...</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSave} className="cursor-pointer">
                  Save
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.print()} className="cursor-pointer">
                  Print
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  Delete document
                </DropdownMenuItem>
              </>
            )}
            {label === "Edit" && (
              <>
                <DropdownMenuItem className="cursor-pointer" onClick={() => editor?.chain().focus().undo().run()}>
                  Undo
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => editor?.chain().focus().redo().run()}>
                  Redo
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => document.execCommand("cut")}>
                  Cut
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => document.execCommand("copy")}>
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => document.execCommand("paste")}>
                  Paste
                </DropdownMenuItem>
              </>
            )}
            {label === "View" && (
              <>
                <DropdownMenuItem className="cursor-pointer">Print layout</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Full screen</DropdownMenuItem>
              </>
            )}
            {(label === "Insert" || label === "Format" || label === "Tools" || label === "Help") && (
              <DropdownMenuItem className="cursor-pointer text-[#5f6368]">
                More options coming soon
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ))}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this document and its Liveblocks room. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteDocument();
              }}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

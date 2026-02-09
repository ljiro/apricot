"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorStore } from "@/app/store/use-editor-store";
import { saveDocumentContent } from "@/lib/document-storage";
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

export function MenuBar({ documentId }: { documentId: string }) {
  const { editor } = useEditorStore();

  const handleSave = () => {
    if (!editor) return;
    try {
      saveDocumentContent(documentId, editor.getJSON() as Record<string, unknown>);
      toast.success("Saved");
    } catch {
      toast.error("Failed to save");
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
    </div>
  );
}

"use client";

import { useEditorStore } from "@/app/store/use-editor-store";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  MessageSquareIcon,
  PrinterIcon,
  Redo2Icon,
  SpellCheckIcon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react";
import { PresenceAvatars } from "./presence-avatars";

const FONTS = ["Arial", "Helvetica", "Times New Roman", "Georgia", "Courier New", "Verdana"];
const FONT_SIZES = ["8", "9", "10", "11", "12", "14", "18", "24", "36", "48", "72", "96"];

interface ToolbarButtonProps {
  onClick?: () => void;
  isActive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const ToolbarButton = ({ onClick, isActive, icon: Icon, label }: ToolbarButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={cn(
      "w-8 h-8 rounded flex items-center justify-center text-[#5f6368] hover:bg-[#f1f3f4] focus:bg-[#f1f3f4] focus:outline-none transition-colors",
      isActive && "bg-[#e8f0fe] text-[#1967d2]"
    )}
  >
    <Icon className="size-4" />
  </button>
);

export const Toolbar = () => {
  const { editor } = useEditorStore();

  return (
    <div className="h-11 flex items-center justify-between gap-2 px-2 bg-white border-b border-[#e8eaed] shrink-0">
      <div className="flex items-center gap-1 overflow-x-auto">
        <ToolbarButton
          label="Undo"
          icon={Undo2Icon}
          onClick={() => editor?.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="Redo"
          icon={Redo2Icon}
          onClick={() => editor?.chain().focus().redo().run()}
        />
        <div className="w-px h-6 bg-[#dadce0] mx-1" />
        <ToolbarButton
          label="Print"
          icon={PrinterIcon}
          onClick={() => window.print()}
        />
        <div className="w-px h-6 bg-[#dadce0] mx-1" />

        {/* Font dropdown - visual only for now */}
        <Select defaultValue="Arial">
          <SelectTrigger className="h-8 w-[120px] border-0 bg-transparent shadow-none hover:bg-[#f1f3f4] rounded text-[13px] text-[#3c4043] font-normal gap-1 focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONTS.map((f) => (
              <SelectItem key={f} value={f} className="text-sm">
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="11">
          <SelectTrigger className="h-8 w-[52px] border-0 bg-transparent shadow-none hover:bg-[#f1f3f4] rounded text-[13px] text-[#3c4043] font-normal gap-0 focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((s) => (
              <SelectItem key={s} value={s} className="text-sm">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="w-px h-6 bg-[#dadce0] mx-1" />

        <ToolbarButton
          label="Bold"
          icon={BoldIcon}
          isActive={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          icon={ItalicIcon}
          isActive={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="Underline"
          icon={UnderlineIcon}
          isActive={editor?.isActive("underline")}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          label="Strikethrough"
          icon={StrikethroughIcon}
          isActive={editor?.isActive("strike")}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        />
        <div className="w-px h-6 bg-[#dadce0] mx-1" />
        <ToolbarButton
          label="Bullet list"
          icon={ListIcon}
          isActive={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Numbered list"
          icon={ListOrderedIcon}
          isActive={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        />
        <div className="w-px h-6 bg-[#dadce0] mx-1" />
        <ToolbarButton
          label="Spell check"
          icon={SpellCheckIcon}
          onClick={() => {
            const el = editor?.view.dom;
            if (!el) return;
            const current = el.getAttribute("spellcheck");
            el.setAttribute("spellcheck", current === "false" ? "true" : "false");
          }}
        />
        <ToolbarButton label="Comment" icon={MessageSquareIcon} onClick={() => {}} />
      </div>
      <PresenceAvatars />
    </div>
  );
};

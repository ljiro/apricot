"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LiveObject } from "@liveblocks/client";
import { useEditorStore, type PendingSuggestion } from "@/app/store/use-editor-store";
import { useMutation } from "@/lib/liveblocks.config";
import {
  MessageSquare,
  Key,
  Send,
  Loader2,
  FileText,
  X,
  Settings2,
  GripVertical,
  Trash2,
  Check,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { markdownToHtml } from "@/lib/markdown-to-html";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const GEMINI_KEY_KEY = "apricot-ai-gemini-key";
const PERPLEXITY_KEY_KEY = "apricot-ai-perplexity-key";
const BUBBLES_STORAGE_KEY = "apricot-ai-bubbles";

type ChatMessage =
  | { role: "user"; content: string }
  | {
      role: "assistant";
      content: string;
      replaceRange?: { from: number; to: number };
      originalText?: string;
    };

export const GEMINI_MODELS = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
] as const;

export type BubbleState = {
  id: string;
  x: number;
  y: number;
  provider: "gemini" | "perplexity";
  geminiModel: string;
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  open: boolean;
  showSettings: boolean;
  includeDocument: boolean;
};

function getStoredKey(key: string): string {
  if (typeof window === "undefined") return "";
  try {
    return sessionStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function setStoredKey(key: string, value: string) {
  try {
    if (value) sessionStorage.setItem(key, value);
    else sessionStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function getDefaultBubblePosition(index: number): { x: number; y: number } {
  if (typeof window === "undefined") return { x: 24, y: 120 };
  const docRight = window.innerWidth / 2 + 794 / 2 + 24;
  const startX = Math.min(docRight, window.innerWidth - 420 - 24);
  const startY = 100 + index * 24;
  return { x: startX, y: startY };
}

function generateId() {
  return `bubble-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AiChatPanel() {
  const { editor, inlineTextSelectionMode } = useEditorStore();
  const lastCapturedSelectionRef = useRef<{ from: number; to: number } | null>(null);

  const addSuggestionToStorage = useMutation(({ storage }, suggestion: PendingSuggestion) => {
    storage.get("suggestions").push(new LiveObject(suggestion));
  }, []);

  const setHighlightRangeInStorage = useMutation(({ storage }, from: number, to: number) => {
    storage.get("highlightRange").set("from", from);
    storage.get("highlightRange").set("to", to);
  }, []);

  const clearHighlightRangeInStorage = useMutation(({ storage }) => {
    storage.get("highlightRange").set("from", -1);
    storage.get("highlightRange").set("to", -1);
  }, []);
  const [geminiKey, setGeminiKeyState] = useState("");
  const [perplexityKey, setPerplexityKeyState] = useState("");
  const [bubbles, setBubbles] = useState<BubbleState[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(BUBBLES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<Partial<BubbleState> & { id: string; x: number; y: number }>;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBubbles(
            parsed.map((b) => ({
              id: b.id,
              x: b.x ?? 24,
              y: b.y ?? 120,
              provider: b.provider ?? "gemini",
              geminiModel: b.geminiModel ?? "gemini-2.5-flash",
              messages: b.messages ?? [],
              input: b.input ?? "",
              loading: false,
              open: b.open ?? true,
              showSettings: false,
              includeDocument: b.includeDocument ?? true,
            }))
          );
        }
      }
    } catch {
      // ignore
    }
  }, []);
  const [dragState, setDragState] = useState<{
    bubbleId: string;
    startX: number;
    startY: number;
    startBubbleX: number;
    startBubbleY: number;
  } | null>(null);
  const [pendingDrag, setPendingDrag] = useState<{
    bubbleId: string;
    startX: number;
    startY: number;
    startBubbleX: number;
    startBubbleY: number;
  } | null>(null);

  useEffect(() => {
    setGeminiKeyState(getStoredKey(GEMINI_KEY_KEY));
    setPerplexityKeyState(getStoredKey(PERPLEXITY_KEY_KEY));
  }, []);

  const setApiKey = useCallback((provider: "gemini" | "perplexity", value: string) => {
    if (provider === "gemini") {
      setGeminiKeyState(value);
      setStoredKey(GEMINI_KEY_KEY, value);
    } else {
      setPerplexityKeyState(value);
      setStoredKey(PERPLEXITY_KEY_KEY, value);
    }
  }, []);

  const getApiKey = useCallback((provider: "gemini" | "perplexity") => {
    return provider === "gemini" ? geminiKey : perplexityKey;
  }, [geminiKey, perplexityKey]);

  const updateBubble = useCallback((id: string, updater: (b: BubbleState) => Partial<BubbleState,>) => {
    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updater(b) } : b))
    );
  }, []);

  const persistBubbles = useCallback((next: BubbleState[]) => {
    try {
      sessionStorage.setItem(
        BUBBLES_STORAGE_KEY,
        JSON.stringify(
          next.map((b) => ({
            id: b.id,
            x: b.x,
            y: b.y,
            provider: b.provider,
            geminiModel: b.geminiModel,
            messages: b.messages.map((m) =>
              m.role === "user" ? m : { role: "assistant" as const, content: m.content }
            ),
            input: b.input,
            open: b.open,
            includeDocument: b.includeDocument,
          }))
        )
      );
    } catch {
      // ignore
    }
  }, []);

  const addBubble = useCallback(() => {
    const pos = getDefaultBubblePosition(bubbles.length);
    const newBubble: BubbleState = {
      id: generateId(),
      x: pos.x,
      y: pos.y,
      provider: "gemini",
      geminiModel: "gemini-2.5-flash",
      messages: [],
      input: "",
      loading: false,
      open: true,
      showSettings: false,
      includeDocument: true,
    };
    setBubbles((prev) => {
      const next = [...prev, newBubble];
      persistBubbles(next);
      return next;
    });
  }, [bubbles.length, persistBubbles]);

  const removeBubble = useCallback(
    (id: string) => {
      setBubbles((prev) => {
        const next = prev.filter((b) => b.id !== id);
        persistBubbles(next);
        return next;
      });
    },
    [persistBubbles]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragState) {
        setBubbles((prev) =>
          prev.map((b) =>
            b.id === dragState.bubbleId
              ? {
                  ...b,
                  x: dragState.startBubbleX + (e.clientX - dragState.startX),
                  y: dragState.startBubbleY + (e.clientY - dragState.startY),
                }
              : b
          )
        );
        return;
      }
      if (pendingDrag && (e.clientX - pendingDrag.startX) ** 2 + (e.clientY - pendingDrag.startY) ** 2 > 25) {
        setDragState(pendingDrag);
        setPendingDrag(null);
      }
    };
    const onUp = () => {
      if (pendingDrag) {
        updateBubble(pendingDrag.bubbleId, () => ({ open: true }));
        setPendingDrag(null);
      }
      if (dragState) {
        setBubbles((prev) => {
          persistBubbles(prev);
          return prev;
        });
      }
      setDragState(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragState, pendingDrag, persistBubbles, updateBubble]);

  const insertIntoDocument = useCallback(
    (text: string) => {
      if (!editor) {
        toast.error("Editor not ready");
        return;
      }
      const html = markdownToHtml(text);
      editor.chain().focus().insertContent(html).run();
      toast.success("Inserted with formatting");
    },
    [editor]
  );

  const captureSelection = useCallback(() => {
    if (!editor || !inlineTextSelectionMode) return;
    try {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        lastCapturedSelectionRef.current = { from, to };
        editor.commands.setHighlightRange(from, to);
        setHighlightRangeInStorage(from, to);
      }
    } catch {
      // ignore
    }
  }, [editor, inlineTextSelectionMode, setHighlightRangeInStorage]);

  const replaceSelectionInDocument = useCallback(
    (text: string, range: { from: number; to: number }) => {
      if (!editor) {
        toast.error("Editor not ready");
        return;
      }
      try {
        const html = markdownToHtml(text);
        editor.chain().focus().insertContentAt(range, html).run();
        editor.commands.clearHighlightRange?.();
        clearHighlightRangeInStorage();
        toast.success("Replaced selection");
      } catch (err) {
        toast.error("Could not replace (document may have changed)");
      }
    },
    [editor, clearHighlightRangeInStorage]
  );

  const sendMessage = useCallback(
    async (bubbleId: string) => {
      const bubble = bubbles.find((b) => b.id === bubbleId);
      if (!bubble) return;
      const { provider, input: bubbleInput, messages, includeDocument, geminiModel } = bubble;
      const trimmed = bubbleInput.trim();
      const apiKey = getApiKey(provider);
      if (!trimmed || !apiKey.trim()) {
        if (!apiKey.trim()) toast.error("Add an API key in settings");
        return;
      }

      let selectedText = "";
      let replaceRange: { from: number; to: number } | null = null;
      const captured = lastCapturedSelectionRef.current;
      if (captured) {
        lastCapturedSelectionRef.current = null;
        editor?.commands.clearHighlightRange?.();
        clearHighlightRangeInStorage();
        if (editor) {
          try {
            selectedText = editor.state.doc.textBetween(captured.from, captured.to, "\n");
            replaceRange = captured;
          } catch {
            // ignore
          }
        }
      } else if (editor) {
        try {
          const { from, to } = editor.state.selection;
          if (from !== to) {
            selectedText = editor.state.doc.textBetween(from, to, "\n");
            replaceRange = { from, to };
          }
        } catch {
          // ignore
        }
      }

      const userContent =
        selectedText.trim().length > 0
          ? `Selected text:\n\n${selectedText.trim()}\n\nUser request: ${trimmed}`
          : trimmed;
      const userMessage: ChatMessage = { role: "user", content: userContent };
      const newMessages: ChatMessage[] = [...messages, userMessage];
      updateBubble(bubbleId, () => ({ input: "", loading: true }));

      let documentContext: string | undefined;
      if (includeDocument && editor) {
        try {
          documentContext = editor.getText() || undefined;
        } catch {
          // ignore
        }
      }

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            apiKey: apiKey.trim(),
            messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
            documentContext,
            ...(provider === "gemini" ? { model: geminiModel || "gemini-2.5-flash" } : {}),
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Request failed");
        }
        const content = data.content ?? "";
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content,
          ...(replaceRange
            ? { replaceRange, originalText: selectedText.trim() || undefined }
            : {}),
        };
        updateBubble(bubbleId, () => ({
          messages: [...newMessages, assistantMessage],
          loading: false,
        }));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to get response");
        updateBubble(bubbleId, () => ({ loading: false }));
      }
    },
    [bubbles, getApiKey, editor, updateBubble]
  );

  useEffect(() => {
    const handler = () => addBubble();
    document.addEventListener("apricot:add-ai-bubble", handler);
    return () => document.removeEventListener("apricot:add-ai-bubble", handler);
  }, [addBubble]);

  useEffect(() => {
    const handler = () => {
      if (bubbles.length === 0) addBubble();
      else
        setBubbles((prev) =>
          prev.map((b, i) => (i === 0 ? { ...b, open: true, showSettings: false } : b))
        );
    };
    document.addEventListener("apricot:focus-ai-chat", handler);
    return () => document.removeEventListener("apricot:focus-ai-chat", handler);
  }, [addBubble, bubbles.length]);

  if (typeof window === "undefined") return null;

  return (
    <>
      {/* Draggable bubbles */}
      {bubbles.map((bubble) => (
        <BubbleCard
          key={bubble.id}
          bubble={bubble}
          geminiKey={geminiKey}
          perplexityKey={perplexityKey}
          setApiKey={setApiKey}
          updateBubble={updateBubble}
          removeBubble={removeBubble}
          sendMessage={sendMessage}
          insertIntoDocument={insertIntoDocument}
          replaceSelectionInDocument={replaceSelectionInDocument}
          captureSelection={captureSelection}
          addDocumentSuggestion={addSuggestionToStorage}
          onDragStart={(e) => {
            e.preventDefault();
            setDragState({
              bubbleId: bubble.id,
              startX: e.clientX,
              startY: e.clientY,
              startBubbleX: bubble.x,
              startBubbleY: bubble.y,
            });
          }}
          onPendingDragStart={(e) => {
            e.preventDefault();
            setPendingDrag({
              bubbleId: bubble.id,
              startX: e.clientX,
              startY: e.clientY,
              startBubbleX: bubble.x,
              startBubbleY: bubble.y,
            });
          }}
        />
      ))}
    </>
  );
}

function BubbleCard({
  bubble,
  geminiKey,
  perplexityKey,
  setApiKey,
  updateBubble,
  removeBubble,
  sendMessage,
  insertIntoDocument,
  replaceSelectionInDocument,
  captureSelection,
  addDocumentSuggestion,
  onDragStart,
  onPendingDragStart,
}: {
  bubble: BubbleState;
  geminiKey: string;
  perplexityKey: string;
  setApiKey: (provider: "gemini" | "perplexity", value: string) => void;
  updateBubble: (id: string, updater: (b: BubbleState) => Partial<BubbleState,>) => void;
  removeBubble: (id: string) => void;
  sendMessage: (id: string) => void;
  insertIntoDocument: (text: string) => void;
  replaceSelectionInDocument: (text: string, range: { from: number; to: number }) => void;
  captureSelection: () => void;
  addDocumentSuggestion: (suggestion: PendingSuggestion) => void;
  onDragStart: (e: React.MouseEvent) => void;
  onPendingDragStart: (e: React.MouseEvent) => void;
}) {
  const { id, x, y, provider, geminiModel = "gemini-2.5-flash", messages, input, loading, open, showSettings, includeDocument } = bubble;
  const apiKey = provider === "gemini" ? geminiKey : perplexityKey;

  if (!open) {
    return (
      <div
        className="fixed z-40 cursor-grab active:cursor-grabbing rounded-full w-14 h-14 flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-white/80 bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white hover:scale-105 transition-transform select-none"
        style={{ left: x, top: y }}
        onMouseDown={(e) => {
          e.preventDefault();
          onPendingDragStart(e);
        }}
      >
        <span className="pointer-events-none flex items-center justify-center w-full h-full rounded-full">
          <MessageSquare className="w-6 h-6" />
        </span>
      </div>
    );
  }

  return (
    <div
      className="fixed z-40 w-[400px] max-w-[calc(100vw-48px)] h-[min(560px,80vh)] flex flex-col rounded-3xl overflow-hidden font-sans bg-white/95 backdrop-blur-xl border border-[#e8e8ec] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
      style={{ left: Math.max(8, x), top: Math.max(8, y) }}
      onMouseDown={captureSelection}
    >
      {/* Header - drag handle */}
      <div
        onMouseDown={onDragStart}
        className="flex items-center justify-between pl-3 pr-2 py-2.5 border-b border-[#eeeef2] bg-[#fafafb] cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="w-4 h-4 text-[#a1a1aa] shrink-0" />
          <span className="text-sm font-medium text-[#3f3f46] truncate">
            {provider === "gemini" ? "Gemini" : "Perplexity"}
          </span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => updateBubble(id, (b) => ({ showSettings: !b.showSettings }))}
            className="p-2 rounded-lg hover:bg-[#e4e4e7] text-[#71717a] transition-colors"
            title="Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => updateBubble(id, () => ({ open: false }))}
            className="p-2 rounded-lg hover:bg-[#e4e4e7] text-[#71717a] transition-colors"
            aria-label="Minimize"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => removeBubble(id)}
            className="p-2 rounded-lg hover:bg-[#fee2e2] text-[#71717a] hover:text-[#dc2626] transition-colors"
            aria-label="Remove"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="px-4 py-3 border-b border-[#eeeef2] bg-[#fafafb] space-y-3 shrink-0">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-[#71717a] shrink-0">Provider</Label>
            <Select
              value={provider}
              onValueChange={(v) => updateBubble(id, () => ({ provider: v as "gemini" | "perplexity" }))}
            >
              <SelectTrigger className="h-8 text-xs flex-1 border-[#e4e4e7]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="perplexity">Perplexity</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {provider === "gemini" && (
            <div className="flex items-center gap-2">
              <Label className="text-xs text-[#71717a] shrink-0">Model</Label>
              <Select
                value={geminiModel || "gemini-2.5-flash"}
                onValueChange={(v) => updateBubble(id, () => ({ geminiModel: v }))}
              >
                <SelectTrigger className="h-8 text-xs flex-1 border-[#e4e4e7]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GEMINI_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs text-[#71717a] flex items-center gap-1">
              <Key className="w-3.5 h-3.5" />
              API key
            </Label>
            <Input
              type="password"
              placeholder="Paste API key"
              value={apiKey}
              onChange={(e) => setApiKey(provider, e.target.value)}
              className="h-8 text-xs border-[#e4e4e7]"
              autoComplete="off"
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-[#71717a] cursor-pointer">
            <input
              type="checkbox"
              checked={includeDocument}
              onChange={(e) => updateBubble(id, () => ({ includeDocument: e.target.checked }))}
              className="rounded border-[#d4d4d8] text-[#6366f1] focus:ring-[#6366f1]"
            />
            Include document in context
          </label>
        </div>
      )}

      <ScrollArea className="flex-1 min-h-0 px-4 py-3">
        <div className="space-y-4 pb-3">
          {messages.length === 0 && !loading && (
            <div className="text-sm text-[#71717a] text-center py-6 space-y-1">
              <p>Ask or request text. Add your API key in settings.</p>
              <p className="text-xs">
                Select text in the document, then ask (e.g. &quot;humanize this&quot;) — selection will be included and you can replace it with the response.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-[#6366f1] text-white rounded-br-md"
                    : "bg-[#f4f4f5] text-[#3f3f46] rounded-bl-md border border-[#e4e4e7]/80"
                )}
              >
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
                {m.role === "assistant" && (
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {m.replaceRange != null && (
                      <>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() =>
                                  replaceSelectionInDocument(m.content, m.replaceRange!)
                                }
                                className="flex items-center gap-1.5 rounded-lg border border-[#6366f1] bg-[#6366f1] px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#4f46e5] transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Accept
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-[#3f3f46] text-white border-0">
                              Replace selection with this response
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => {
                                  addDocumentSuggestion({
                                    id: `sug-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                                    from: m.replaceRange!.from,
                                    to: m.replaceRange!.to,
                                    originalText: m.originalText ?? "",
                                    suggestedContent: m.content,
                                  });
                                  toast.success("Suggestion added next to the text — Accept or Reject there.");
                                }}
                                className="flex items-center gap-1.5 rounded-lg border border-[#0d9488] bg-[#0d9488] px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#0f766e] transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                Suggest change
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-[#3f3f46] text-white border-0">
                              Add suggestion next to the text — Accept or Reject there
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => insertIntoDocument(m.content)}
                            className="flex items-center gap-1.5 rounded-lg border border-[#e4e4e7] bg-white px-2.5 py-1.5 text-xs font-medium text-[#3f3f46] shadow-sm hover:border-[#6366f1] hover:bg-[#f5f3ff] hover:text-[#6366f1] transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Insert at cursor
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-[#3f3f46] text-white border-0">
                          Inserts at cursor with formatting preserved
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md px-4 py-2.5 bg-[#f4f4f5] border border-[#e4e4e7]/80">
                <Loader2 className="w-4 h-4 animate-spin text-[#71717a]" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-[#eeeef2] bg-white shrink-0">
        <div className="flex gap-2 rounded-2xl bg-[#f4f4f5] border border-[#e4e4e7] p-1.5 focus-within:border-[#6366f1] focus-within:ring-1 focus-within:ring-[#6366f1]/30 transition-all">
          <input
            type="text"
            placeholder="Message..."
            value={input}
            onChange={(e) => updateBubble(id, () => ({ input: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(id);
              }
            }}
            className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm text-[#3f3f46] placeholder:text-[#a1a1aa] outline-none"
            disabled={loading}
          />
          <Button
            type="button"
            size="icon"
            className="h-9 w-9 rounded-xl shrink-0 bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-sm"
            onClick={() => sendMessage(id)}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

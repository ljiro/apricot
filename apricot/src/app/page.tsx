"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FileTextIcon, MenuIcon, Grid3X3Icon, SearchIcon } from "lucide-react";
import { TemplatePreview } from "@/components/template-preview";
import { getRecentDocs, addRecentDoc, type RecentDoc } from "@/lib/recent-docs";

const TEMPLATES = [
  { id: "blank", label: "Blank", description: "Start from an empty document" },
  { id: "resume", label: "Resume", description: "Professional resume" },
  { id: "letter", label: "Letter", description: "Formal letter" },
  { id: "meeting", label: "Meeting notes", description: "Agenda and actions" },
  { id: "todo", label: "To-do list", description: "Tasks and checkboxes" },
] as const;

function generateDocumentId() {
  return Math.random().toString(36).slice(2, 12);
}

export default function Home() {
  const router = useRouter();
  const [recent, setRecent] = useState<RecentDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setRecent(getRecentDocs());
  }, []);

  const filteredRecent = searchQuery.trim()
    ? recent.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : recent;

  const openDocument = useCallback(
    (templateId?: string) => {
      const id = generateDocumentId();
      const url = templateId ? `/documents/${id}?template=${templateId}` : `/documents/${id}`;
      addRecentDoc(id, "Untitled document");
      router.push(url);
    },
    [router]
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Top bar - Google Docs 1:1: no sidebar, single header row */}
      <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-[#dadce0] shrink-0">
        <div className="flex items-center gap-1 min-w-0">
          <button
            type="button"
            aria-label="Main menu"
            className="p-2 rounded-full hover:bg-[#f1f3f4] transition-colors text-[#5f6368]"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 py-2 px-2 -ml-2 rounded-lg hover:bg-[#f1f3f4] transition-colors min-w-0"
          >
            <div className="w-8 h-8 rounded flex items-center justify-center bg-[#4285f4] shrink-0">
              <FileTextIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-[22px] font-normal text-[#3c4043] tracking-tight truncate hidden sm:inline">
              Docs
            </span>
          </Link>
        </div>

        <div className="flex-1 max-w-[720px] mx-4 hidden md:block">
          <div className="flex items-center h-10 px-4 rounded-lg bg-[#f1f3f4] border border-transparent hover:bg-[#e8eaed] focus-within:bg-white focus-within:shadow-[0_1px_6px_rgba(32,33,36,0.28)] focus-within:border-transparent transition-all">
            <SearchIcon className="w-5 h-5 text-[#5f6368] shrink-0" />
            <input
              type="search"
              placeholder="Search documents"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 ml-3 min-w-0 bg-transparent border-none outline-none text-sm text-[#3c4043] placeholder:text-[#5f6368]"
              aria-label="Search documents"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            aria-label="Google apps"
            className="p-2 rounded-full hover:bg-[#f1f3f4] transition-colors text-[#5f6368]"
          >
            <Grid3X3Icon className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Account"
            className="w-8 h-8 rounded-full bg-[#1a73e8] text-white text-sm font-medium flex items-center justify-center hover:ring-2 hover:ring-[#1a73e8]/30 transition-shadow"
          >
            A
          </button>
        </div>
      </header>

      {/* Main content: grey top (new + templates), white bottom (recent) */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* New documents + templates in one row — grey background */}
        <section className="bg-[#f1f3f4] shrink-0">
          <div className="max-w-[960px] mx-auto py-8 px-6 md:px-10">
            <h2 className="text-[#3c4043] text-[22px] font-normal mb-4">Start a new document</h2>
            <div className="flex flex-wrap gap-4">
              {/* Blank document — hover highlight only on preview */}
              <button
                type="button"
                onClick={() => openDocument()}
                className="group flex flex-col w-[180px] rounded-lg bg-transparent p-0 text-left overflow-hidden shrink-0 hover:bg-transparent focus:bg-transparent active:bg-transparent focus:outline-none"
              >
                <div className="aspect-[210/297] min-h-0 rounded-lg overflow-hidden bg-white transition-[box-shadow] duration-150 group-hover:shadow-[0_2px_12px_rgba(66,133,244,0.22)] group-hover:ring-[3px] group-hover:ring-[#4285f4] group-hover:ring-inset">
                  <TemplatePreview templateId="blank" className="group-hover:bg-[#e8f0fe] transition-colors" />
                </div>
                <div className="px-3 py-2.5 bg-transparent" style={{ background: "transparent" }}>
                  <span className="text-sm font-bold text-[#3c4043]">Blank</span>
                </div>
              </button>
              {/* Template cards — hover highlight only on preview */}
              {TEMPLATES.filter((t) => t.id !== "blank").map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => openDocument(t.id)}
                  className="group flex flex-col w-[180px] rounded-lg bg-transparent p-0 text-left overflow-hidden shrink-0 hover:bg-transparent focus:bg-transparent active:bg-transparent focus:outline-none"
                >
                  <div className="aspect-[210/297] min-h-0 rounded-lg overflow-hidden bg-white transition-[box-shadow] duration-150 group-hover:shadow-[0_2px_12px_rgba(66,133,244,0.22)] group-hover:ring-[3px] group-hover:ring-[#4285f4] group-hover:ring-inset">
                    <TemplatePreview templateId={t.id} className="group-hover:bg-[#e8f0fe] transition-colors" />
                  </div>
                  <div className="px-3 py-2.5 bg-transparent" style={{ background: "transparent" }}>
                    <span className="text-sm font-bold text-[#3c4043] block">{t.label}</span>
                    <span className="text-xs text-[#5f6368] mt-0.5 line-clamp-2 block font-normal">
                      {t.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Recent documents — white background */}
        <section className="flex-1 overflow-auto bg-white">
          <div className="max-w-[960px] mx-auto py-8 px-6 md:px-10">
            <h2 className="text-[#3c4043] text-[22px] font-normal mb-4">Recent</h2>
            {filteredRecent.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {filteredRecent.slice(0, 4).map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="group block w-[180px] text-left rounded-lg bg-transparent overflow-hidden hover:bg-transparent focus:outline-none"
                  >
                    <div className="aspect-[210/297] rounded-lg overflow-hidden bg-white flex items-center justify-center relative transition-[box-shadow] duration-150 group-hover:shadow-[0_2px_12px_rgba(66,133,244,0.22)] group-hover:ring-[3px] group-hover:ring-[#4285f4] group-hover:ring-inset">
                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_85%,#f1f3f4_85%)] opacity-60" />
                      <FileTextIcon className="w-10 h-10 text-[#5f6368] group-hover:text-[#4285f4] transition-colors relative z-10" />
                    </div>
                    <div className="px-3 py-2.5 bg-transparent truncate" style={{ background: "transparent" }}>
                      <span className="text-sm font-bold text-[#3c4043] block truncate">
                        {doc.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[#5f6368] text-sm">
                {searchQuery.trim() ? "No documents match your search" : "No recent documents"}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

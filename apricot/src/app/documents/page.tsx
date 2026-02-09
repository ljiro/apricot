"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getRecentDocs, type RecentDoc } from "@/lib/recent-docs";
import { FileTextIcon, PlusIcon, ChevronRightIcon } from "lucide-react";

function generateDocumentId() {
  return Math.random().toString(36).slice(2, 12);
}

export default function DocumentsPage() {
  const router = useRouter();
  const [recent, setRecent] = useState<RecentDoc[]>([]);
  const [docId, setDocId] = useState("");

  useEffect(() => {
    setRecent(getRecentDocs());
  }, []);

  const handleNewDocument = () => {
    router.push(`/documents/${generateDocumentId()}`);
  };

  const handleOpenById = (e: React.FormEvent) => {
    e.preventDefault();
    const id = docId.trim();
    if (id) router.push(`/documents/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      <aside className="w-[280px] min-w-[280px] flex flex-col bg-white border-r border-[#dadce0] shrink-0">
        <div className="h-12 flex items-center pl-4 pr-3">
          <Link
            href="/"
            className="flex items-center gap-3 py-2 px-1 -ml-1 rounded-lg hover:bg-[#f1f3f4] transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[#4285f4] flex items-center justify-center shadow-sm">
              <FileTextIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-[22px] font-normal text-[#3c4043] tracking-tight">Apricot</span>
          </Link>
        </div>
        <button
          type="button"
          onClick={handleNewDocument}
          className="mx-3 mt-2 h-10 flex items-center justify-center gap-2 rounded-lg bg-white border border-[#dadce0] text-[#1a73e8] hover:bg-[#f0f7ff] hover:border-[#c2e7ff] active:bg-[#e8f0fe] transition-colors shadow-sm font-medium text-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Create
        </button>
        <nav className="flex-1 mt-4 px-2">
          <Link
            href="/"
            className="flex items-center justify-between h-9 px-3 rounded-lg text-[#3c4043] hover:bg-[#f1f3f4] transition-colors text-sm"
          >
            <span>Home</span>
            <ChevronRightIcon className="w-4 h-4 text-[#5f6368]" />
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-[960px] mx-auto py-8 px-10">
          <h1 className="text-[#3c4043] text-[22px] font-normal mb-6">Documents</h1>

          <section className="mb-8">
            <h2 className="text-[#3c4043] text-base font-medium mb-3">Open by document ID</h2>
            <form onSubmit={handleOpenById} className="flex gap-2 max-w-md">
              <input
                type="text"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                placeholder="Paste or type document ID"
                className="flex-1 h-10 px-3 rounded-lg border border-[#dadce0] bg-white text-[#3c4043] placeholder:text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-lg bg-[#1a73e8] text-white text-sm font-medium hover:bg-[#1765cc] active:bg-[#1557b0] transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                Open
              </button>
            </form>
          </section>

          {recent.length > 0 && (
            <section>
              <h2 className="text-[#3c4043] text-base font-medium mb-3">Recent</h2>
              <div className="flex flex-wrap gap-4">
                {recent.slice(0, 6).map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="group block w-[160px] text-left rounded-xl border border-[#dadce0] bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-[#c2e7ff] active:scale-[0.98] transition-all duration-150"
                  >
                    <div className="aspect-[4/3] bg-white flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,transparent_85%,#f1f3f4_85%)] opacity-60" />
                      <FileTextIcon className="w-10 h-10 text-[#5f6368] group-hover:text-[#4285f4] transition-colors" />
                    </div>
                    <div className="px-3 py-2.5 border-t border-[#f1f3f4] truncate">
                      <span className="text-sm font-medium text-[#3c4043] block truncate">
                        {doc.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="mt-8 text-sm text-[#5f6368]">
            Share the document URL with others to collaborate in real time.
          </p>
        </div>
      </main>
    </div>
  );
}

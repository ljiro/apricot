import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      {/* Header skeleton */}
      <header className="flex items-center gap-3 h-12 pl-2 pr-4 border-b border-[#e8eaed] bg-white shrink-0">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="flex-1 max-w-md h-6 rounded ml-4" />
      </header>
      {/* Menu bar skeleton */}
      <div className="h-8 flex items-center gap-2 px-2 bg-white border-b border-[#e8eaed] shrink-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-5 w-12 rounded" />
        ))}
      </div>
      {/* Toolbar skeleton */}
      <div className="h-10 flex items-center gap-1 px-2 bg-white border-b border-[#e8eaed] shrink-0">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-7 w-7 rounded" />
        ))}
      </div>
      {/* Editor area skeleton */}
      <main className="flex-1 p-10 max-w-[816px] mx-auto w-full">
        <div className="space-y-3">
          <Skeleton className="h-7 w-full max-w-md rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-[80%] rounded" />
        </div>
      </main>
    </div>
  );
}

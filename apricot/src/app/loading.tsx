export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#dadce0] border-t-[#1a73e8] rounded-full animate-spin" />
        <p className="text-sm text-[#5f6368]">Loading...</p>
      </div>
    </div>
  );
}

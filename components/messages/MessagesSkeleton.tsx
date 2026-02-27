"use client";

export function MessagesSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-2xl border border-navy-700/30 bg-navy-900/40">
      {/* Left panel skeleton */}
      <div className="w-80 shrink-0 border-r border-navy-700/30 p-4">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-navy-800/60" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-3 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-navy-800/60" />
            <div className="flex-1">
              <div className="mb-1 h-4 w-28 animate-pulse rounded bg-navy-800/60" />
              <div className="h-3 w-40 animate-pulse rounded bg-navy-800/40" />
            </div>
          </div>
        ))}
      </div>

      {/* Right panel skeleton */}
      <div className="flex flex-1 flex-col">
        {/* Header skeleton */}
        <div className="flex items-center gap-3 border-b border-navy-700/30 p-4">
          <div className="h-10 w-10 animate-pulse rounded-full bg-navy-800/60" />
          <div className="h-5 w-32 animate-pulse rounded bg-navy-800/60" />
        </div>

        {/* Messages skeleton */}
        <div className="flex-1 space-y-4 p-6">
          <div className="flex gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-navy-800/60" />
            <div className="h-16 w-52 animate-pulse rounded-2xl bg-navy-800/60" />
          </div>
          <div className="flex flex-row-reverse gap-3">
            <div className="h-12 w-44 animate-pulse rounded-2xl bg-gold-500/10" />
          </div>
          <div className="flex gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-navy-800/60" />
            <div className="h-20 w-64 animate-pulse rounded-2xl bg-navy-800/60" />
          </div>
        </div>

        {/* Input skeleton */}
        <div className="border-t border-navy-700/30 p-4">
          <div className="h-10 w-full animate-pulse rounded-lg bg-navy-800/60" />
        </div>
      </div>
    </div>
  );
}

'use client';

import SkeletonBase from './SkeletonBase';

export default function CapacitiesTreeSkeleton() {
  return (
    <div className="w-full h-screen flex flex-col gap-6 p-4">
      {/* Title + search */}
      <div className="flex flex-row gap-4 items-center">
        <SkeletonBase className="h-8 w-48" />
        <SkeletonBase className="h-10 flex-1 rounded-lg" />
      </div>

      {/* Tree visualization area */}
      <div className="flex-1 relative">
        <SkeletonBase className="w-full h-full rounded-lg min-h-[400px]" />
        {/* Simulate tree nodes */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-8">
            <SkeletonBase className="w-24 h-10 rounded-full" />
            <div className="flex flex-row gap-16">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-6">
                  <SkeletonBase className="w-20 h-9 rounded-full" />
                  <div className="flex flex-row gap-6">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <SkeletonBase key={j} className="w-16 h-8 rounded-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

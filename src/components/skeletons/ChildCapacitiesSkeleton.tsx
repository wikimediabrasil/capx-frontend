'use client';

import SkeletonBase from './SkeletonBase';

export default function ChildCapacitiesSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBase className="w-8 h-8 rounded flex-shrink-0" />
          <SkeletonBase className={`h-5 rounded ${i % 3 === 0 ? 'w-3/4' : i % 3 === 1 ? 'w-2/3' : 'w-1/2'}`} />
        </div>
      ))}
    </div>
  );
}

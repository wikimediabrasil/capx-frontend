'use client';

import SkeletonBase from './SkeletonBase';

export default function ProjectCardSkeleton() {
  return (
    <div className="rounded-[16px] w-[350px] flex-shrink-0 flex flex-col h-[400px] bg-[#EFEFEF]">
      <SkeletonBase className="w-full h-[200px] rounded-t-[16px] rounded-b-none" />
      <div className="p-4 flex flex-col gap-3 flex-1">
        <SkeletonBase className="h-5 w-3/4" />
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-5/6" />
        <div className="mt-auto">
          <SkeletonBase className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

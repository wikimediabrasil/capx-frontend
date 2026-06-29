'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';

function TranslationRowSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <div
      className={`rounded-lg border px-4 py-4 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Header: QID + status badge */}
      <div className="flex items-center gap-2 mb-3">
        <SkeletonBase className="h-4 w-20" />
        <SkeletonBase className="h-5 w-16 rounded-full" />
      </div>

      {/* Two-column grid: reference | translation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reference column */}
        <div className="flex flex-col gap-3">
          <SkeletonBase className="h-3 w-32" />
          <SkeletonBase className="h-4 w-40" />
          <SkeletonBase className="h-3 w-full" />
          <SkeletonBase className="h-3 w-5/6" />
        </div>

        {/* Editable column */}
        <div className="flex flex-col gap-3">
          <SkeletonBase className="h-3 w-24" />
          <SkeletonBase className="h-9 w-full rounded" />
          <SkeletonBase className="h-16 w-full rounded" />
          <div className="flex justify-end">
            <SkeletonBase className="h-8 w-20 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TranslationPageSkeleton() {
  const darkMode = useDarkMode();
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <section
      className={`w-full min-h-screen pt-24 md:pt-8 ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'}`}
    >
      <div className="mx-auto max-w-[1200px] px-4 flex flex-col gap-6 pb-16">
        {/* Banner */}
        <div className="flex flex-row items-center gap-4">
          <SkeletonBase className="w-16 h-16 rounded-lg flex-shrink-0" />
          <SkeletonBase className="h-8 w-48" />
        </div>

        {/* Info notice bar */}
        <SkeletonBase className="h-12 w-full rounded-lg" />

        {/* OAuth status bar */}
        <SkeletonBase className="h-14 w-full rounded-lg" />

        {/* Controls row */}
        <div className={`rounded-lg border ${cardBg} px-4 py-4 flex flex-col sm:flex-row gap-4`}>
          <div className="flex flex-col gap-1">
            <SkeletonBase className="h-3 w-24" />
            <SkeletonBase className="h-9 w-32 rounded" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <SkeletonBase className="h-3 w-16" />
            <SkeletonBase className="h-9 w-full rounded" />
          </div>
          <div className="flex flex-col gap-1">
            <SkeletonBase className="h-3 w-12" />
            <SkeletonBase className="h-9 w-24 rounded" />
          </div>
          <div className="flex flex-col gap-1">
            <SkeletonBase className="h-3 w-20" />
            <SkeletonBase className="h-9 w-32 rounded" />
          </div>
          <SkeletonBase className="h-9 w-24 rounded self-end" />
          <SkeletonBase className="h-4 w-32 self-end" />
        </div>

        {/* Translation rows */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <TranslationRowSkeleton key={i} darkMode={darkMode} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2">
          <SkeletonBase className="h-8 w-8 rounded" />
          <SkeletonBase className="h-8 w-8 rounded" />
          <SkeletonBase className="h-8 w-8 rounded" />
          <SkeletonBase className="h-8 w-8 rounded" />
          <SkeletonBase className="h-8 w-8 rounded" />
        </div>
      </div>
    </section>
  );
}

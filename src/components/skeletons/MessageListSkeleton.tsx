'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';

function MessageCardSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <div className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} flex flex-col gap-3`}>
      <div className="flex justify-between items-center">
        <SkeletonBase className="h-5 w-32" />
        <SkeletonBase className="h-4 w-20" />
      </div>
      <SkeletonBase className="h-4 w-full" />
      <SkeletonBase className="h-4 w-5/6" />
    </div>
  );
}

export default function MessageListSkeleton() {
  const darkMode = useDarkMode();

  return (
    <section className="w-full h-full flex flex-col gap-4 px-4 py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <MessageCardSkeleton key={i} darkMode={darkMode} />
      ))}
    </section>
  );
}

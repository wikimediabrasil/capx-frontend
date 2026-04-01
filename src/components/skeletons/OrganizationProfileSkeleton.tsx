'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';

function ProfileItemSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <SkeletonBase className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0" />
        <SkeletonBase className="h-5 md:h-7 w-48" />
      </div>
      <div className="flex flex-col gap-2 pl-7 md:pl-8">
        <SkeletonBase className="h-5 md:h-7 w-full" />
        <SkeletonBase className="h-5 md:h-7 w-5/6" />
        <SkeletonBase className="h-5 md:h-7 w-3/4" />
      </div>
    </div>
  );
}

function CardRowSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <div className="flex flex-row gap-4 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`rounded-[16px] w-[350px] flex-shrink-0 flex flex-col h-[400px] ${darkMode ? 'bg-gray-700' : 'bg-[#EFEFEF]'}`}
        >
          <SkeletonBase className="w-full h-[200px] rounded-t-[16px] rounded-b-none" />
          <div className="p-4 flex flex-col gap-3 flex-1">
            <SkeletonBase className="h-5 w-3/4" />
            <SkeletonBase className="h-4 w-full" />
            <SkeletonBase className="h-4 w-5/6" />
            <div className="mt-auto">
              <SkeletonBase className="h-9 w-full rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrganizationProfileSkeleton() {
  const darkMode = useDarkMode();

  return (
    <div className={`relative w-full overflow-x-hidden ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'}`}>
      <section className="w-full max-w-screen-xl mx-auto px-4 py-8 mt-[80px]">
        <div className="flex flex-col gap-6 md:gap-8">

          {/* Header section */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full flex flex-col gap-4 justify-center">
              {/* Welcome text */}
              <SkeletonBase className="h-6 md:h-10 lg:h-14 w-48" />
              {/* Org name */}
              <div className="flex items-center gap-2 mb-2">
                <SkeletonBase className="w-5 h-5 md:w-8 md:h-8 rounded-full flex-shrink-0" />
                <SkeletonBase className="h-5 md:h-7 w-48 md:w-64" />
              </div>
              {/* Logo */}
              <div className="w-full">
                <SkeletonBase className="h-[78px] w-full md:h-[326px] md:w-[595px] rounded-md md:rounded-[16px]" />
              </div>
              {/* Buttons */}
              <SkeletonBase className="h-[32px] md:h-[64px] w-full rounded-[8px]" />
              <SkeletonBase className="h-[32px] md:h-[64px] w-full rounded-[8px]" />
            </div>
          </div>

          {/* Report activity banner */}
          <SkeletonBase className="w-full h-[120px] md:h-[399px] rounded-[4px]" />

          {/* Capacities section */}
          <div className="space-y-6 mt-4">
            <ProfileItemSkeleton />
            <ProfileItemSkeleton />
            <ProfileItemSkeleton />
          </div>

          {/* Territory */}
          <div className="mt-6">
            <ProfileItemSkeleton />
          </div>

          {/* Projects */}
          <div className="space-y-6 mt-4">
            <SkeletonBase className="h-5 md:h-7 w-40" />
            <CardRowSkeleton darkMode={darkMode} />
          </div>

          {/* Events */}
          <div className="space-y-6 mt-4">
            <SkeletonBase className="h-5 md:h-7 w-32" />
            <div className="flex flex-row gap-8 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex flex-col rounded-[4px] p-4 min-w-[300px] border ${darkMode ? 'bg-capx-dark-box-bg border-white' : 'bg-capx-light-box-bg border-gray-200'}`}
                >
                  <SkeletonBase className="h-6 w-3/4 mb-4" />
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <SkeletonBase className="w-4 h-4 rounded-full flex-shrink-0" />
                      <SkeletonBase className="h-4 w-36" />
                    </div>
                    <div className="flex items-center gap-2">
                      <SkeletonBase className="w-4 h-4 rounded-full flex-shrink-0" />
                      <SkeletonBase className="h-4 w-40" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <SkeletonBase className="h-5 md:h-7 w-36" />
            <div className="flex flex-row gap-4 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-[16px] flex-shrink-0 flex flex-col w-[85vw] max-w-[350px] md:w-[350px] ${darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'}`}
                >
                  <div className="p-6 flex items-center justify-center h-[250px]">
                    <SkeletonBase className="w-[200px] h-[200px] rounded" />
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <SkeletonBase className="h-5 w-3/4" />
                    <SkeletonBase className="h-9 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="flex flex-row gap-4">
            <SkeletonBase className="h-9 w-28 rounded-lg" />
            <SkeletonBase className="h-9 w-28 rounded-lg" />
            <SkeletonBase className="h-9 w-28 rounded-lg" />
          </div>

        </div>
      </section>
    </div>
  );
}

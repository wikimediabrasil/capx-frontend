'use client';

interface ProgressBarProps {
  progress: number;
  darkMode: boolean;
}

export default function ProgressBar({ progress, darkMode }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className={`text-xs text-gray-600 mt-1 ${darkMode ? 'text-white' : 'text-[#053749]'}`}>
        {progress}%
      </div>
    </div>
  );
}

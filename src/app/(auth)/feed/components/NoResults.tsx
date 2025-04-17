import { useTheme } from "@/contexts/ThemeContext";

interface NoResultsProps {
  title: string;
  description?: string;
}

export function NoResults({ title, description }: NoResultsProps) {
  const { darkMode } = useTheme();
  
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
        {title}
      </p>
      {description && (
        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      )}
    </div>
  );
}

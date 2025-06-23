import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';

interface CheckboxButtonProps {
  icon: string;
  iconDark: string;
  label: string;
  checked: boolean;
  onClick: () => void;
}

export function CheckboxButton({ icon, iconDark, label, checked, onClick }: CheckboxButtonProps) {
  const { darkMode } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg border flex justify-between items-center ${
        checked
          ? darkMode
            ? 'bg-capx-dark-box-bg border-purple-500'
            : 'bg-purple-100 border-purple-500'
          : darkMode
            ? 'bg-capx-dark-box-bg border-gray-700'
            : 'bg-white border-gray-300'
      }`}
    >
      <div className="flex items-center gap-2">
        <Image src={darkMode ? iconDark : icon} alt={label} width={20} height={20} />
        <span className={darkMode ? 'text-white' : 'text-black'}>{label}</span>
      </div>
      <div className="ml-auto">
        <input type="checkbox" checked={checked} readOnly className="h-4 w-4" />
      </div>
    </button>
  );
}

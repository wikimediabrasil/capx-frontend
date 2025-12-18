import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import ArrowDownIcon from '@/public/static/images/arrow_drop_down_circle.svg';
import ArrowDownIconWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';

interface FormSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  placeholder: string;
}

export function FormSelect({ value, onChange, options, placeholder }: FormSelectProps) {
  const { darkMode } = useTheme();
  const { isMobile } = useApp();

  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-4 py-2 rounded-[4px] md:rounded-[16px] font-[Montserrat] text-[12px] md:text-[24px] appearance-none ${
          darkMode
            ? 'bg-transparent border-white text-white opacity-50'
            : 'border-[#053749] text-[#829BA4]'
        } border`}
        style={{
          backgroundColor: darkMode ? '#053749' : 'white',
          color: darkMode ? 'white' : '#053749',
        }}
      >
        <option value="">{placeholder}</option>
        {Object.entries(options).map(([id, name]) => (
          <option
            key={id}
            value={id}
            style={{
              backgroundColor: darkMode ? '#053749' : 'white',
              color: darkMode ? 'white' : '#053749',
            }}
          >
            {name}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <Image
          src={darkMode ? ArrowDownIconWhite : ArrowDownIcon}
          alt="Select"
          width={isMobile ? 20 : 24}
          height={isMobile ? 20 : 24}
        />
      </div>
    </div>
  );
}

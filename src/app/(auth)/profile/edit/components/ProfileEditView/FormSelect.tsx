import { useTheme } from '@/contexts/ThemeContext';
import ArrowDownIcon from '@/public/static/images/arrow_drop_down_circle.svg';
import ArrowDownIconWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';
import { ResponsiveIcon } from './ResponsiveIcon';
import { RESPONSIVE_TEXT_SIZES, RESPONSIVE_BORDER_RADIUS } from './utils';

interface FormSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  placeholder: string;
}

export function FormSelect({ value, onChange, options, placeholder }: FormSelectProps) {
  const { darkMode } = useTheme();
  const selectStyles = {
    backgroundColor: darkMode ? '#053749' : 'white',
    color: darkMode ? 'white' : '#053749',
  };

  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full px-4 py-2 ${RESPONSIVE_BORDER_RADIUS.small} font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.medium} appearance-none ${
          darkMode
            ? 'bg-transparent border-white text-white opacity-50'
            : 'border-[#053749] text-[#829BA4]'
        } border`}
        style={selectStyles}
      >
        <option value="">{placeholder}</option>
        {Object.entries(options).map(([id, name]) => (
          <option key={id} value={id} style={selectStyles}>
            {name}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <ResponsiveIcon
          lightIcon={ArrowDownIcon}
          darkIcon={ArrowDownIconWhite}
          alt="Select"
          mobileSize={20}
          desktopSize={24}
        />
      </div>
    </div>
  );
}

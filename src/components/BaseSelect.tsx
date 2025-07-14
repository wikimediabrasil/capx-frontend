import Select from 'react-select';
import ArrowDropDownCircle from '../../public/static/images/arrow_drop_down_circle.svg';
import ArrowDropDownCircleWhite from '../../public/static/images/arrow_drop_down_circle_white.svg';
import Image from 'next/image';

interface Option {
  value: string;
  label: string;
}

interface BaseSelectProps {
  name: string;
  options: any[];
  defaultValue?: any;
  value?: any;
  onChange: (value: any) => void;
  ariaLabel?: string;
  isMobile: boolean;
  darkMode: boolean;
  className?: string;
  onContainerClick?: () => void;
  onMenuOpen?: () => void;
  placeholder?: string;
}

const DropdownIndicator = (isMobile: boolean, darkMode: boolean) => (
  <Image
    src={darkMode ? ArrowDropDownCircleWhite : ArrowDropDownCircle}
    alt="dropdown indicator"
    width={isMobile ? 20 : 40}
    height={isMobile ? 20 : 40}
    className="object-contain"
  />
);

const PADDING = {
  mobile: {
    x: '!px-4', // 16px
    y: '!py-2', // 8px
  },
  desktop: {
    x: '!px-8', // 32px
    y: '!py-4', // 16px
  },
};

const customStyles = (darkMode: boolean) => ({
  control: (provided: any) => ({
    ...provided,
    border: `2px solid ${darkMode ? '#FFFFFF' : '#053749'}`,
    borderRadius: '8px',
    padding: '8px 16px',
    boxShadow: 'none',
    '&:hover': {
      border: `2px solid ${darkMode ? '#FFFFFF' : '#053749'}`,
    },
    minHeight: '32px',
  }),
  option: (provided: any, state: { isSelected: boolean }) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#053749' : 'white',
    color: state.isSelected ? 'white' : '#053749',
    padding: '16px',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: '#053749',
      color: '#FFFFFF',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    border: '2px solid #053749',
    backgroundColor: '#FFFFFF',
  }),
  menuList: (provided: any) => ({
    ...provided,
    padding: 0,
    backgroundColor: '#FFFFFF',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: darkMode ? '#FFFFFF' : '#053749',
    fontWeight: 'bold',
  }),
});

export default function BaseSelect({
  name,
  options,
  defaultValue,
  value,
  onChange,
  ariaLabel,
  isMobile,
  darkMode,
  className = '',
  onContainerClick,
  onMenuOpen,
  placeholder,
}: BaseSelectProps) {
  return (
    <div onClick={onContainerClick}>
      <Select
        name={name}
        options={options}
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        className={`${className} ${isMobile ? 'w-[73px] h-8' : 'w-[100px]'} ${
          darkMode ? 'text-white border-white' : 'text-[#053749] border-[#053749]'
        }`}
        components={{
          DropdownIndicator: () => DropdownIndicator(isMobile, darkMode),
          IndicatorSeparator: () => null,
        }}
        unstyled={true}
        classNames={{
          control: () =>
            `${
              isMobile
                ? `flex !px-3 !py-0 items-center h-8 gap-2`
                : `flex h-[64px] px-8 !pl-[32px] !pr-[32px] items-center gap-[8px]`
            }
            ${darkMode ? '!border-capx-dark-text' : '!border-capx-light-text'}`,
          container: () => 'relative',
          valueContainer: () => 'flex flex-1 items-center justify-center',
          singleValue: () =>
            `align-middle
          ${
            isMobile
              ? `text-[14px] font-bold`
              : `text-center text-[24px] not-italic font-extrabold leading-[normal] flex-1`
          }`,
          indicatorSeparator: () => 'hidden',
          dropdownIndicator: () =>
            `flex items-center ${isMobile ? '!w-[20px] !h-[20px]' : '!w-[40px] !h-[40px]'}`,
          option: ({ isSelected }) =>
            `${
              isSelected
                ? darkMode
                  ? 'bg-capx-dark-bg text-capx-light-text'
                  : 'bg-capx-light-bg text-capx-dark-text'
                : darkMode
                  ? 'bg-capx-dark-bg text-capx-light-text'
                  : 'bg-capx-light-bg text-capx-dark-text'
            } p-4 font-bold hover:bg-capx-light-bg hover:text-capx-dark-text`,
          menu: () =>
            `rounded-lg shadow-lg border-2 ${
              darkMode
                ? 'bg-capx-dark-bg text-capx-light-text'
                : 'bg-capx-light-bg text-capx-dark-text'
            }`,
          menuList: () => 'p-0',
        }}
        styles={customStyles(darkMode)}
        isSearchable={false}
        onMenuOpen={onMenuOpen}
        placeholder={placeholder}
      />
    </div>
  );
}

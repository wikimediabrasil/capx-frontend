'use client';
import Image from 'next/image';

interface BaseButtonProps {
  label: string | React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  customClass?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export default function BaseButton({
  label,
  onClick,
  type = 'button',
  disabled = false,
  customClass = '',
  imageUrl,
  imageAlt = 'Button icon',
  imageWidth = 24,
  imageHeight = 24,
}: BaseButtonProps) {
  const defaultClass =
    'flex justify-center items-center gap-2 px-8 py-4 rounded-lg bg-capx-secondary-purple hover:bg-capx-primary-green text-[#F6F6F6] hover:text-capx-dark-bg font-extrabold text-3.5 sm:text-3.5 rounded-lg text-center text-2xl not-italic leading-[normal]';

  const buttonClass = customClass || defaultClass;
  const justifyClass = imageUrl ? 'justify-between pb-4' : 'justify-center';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${buttonClass} ${justifyClass}`}
    >
      <span>{label}</span>
      {imageUrl && (
        <div className="relative" style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}>
          <Image src={imageUrl} alt={imageAlt} fill className="object-contain" />
        </div>
      )}
    </button>
  );
}

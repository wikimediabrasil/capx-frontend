'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import Image from 'next/image';

interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  customClass?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
}

const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  (
    { label, error, className = '', customClass = '', icon, iconPosition = 'right', ...props },
    ref
  ) => {
    return (
      <div className="flex flex-col w-full">
        {label && <label className="mb-2 text-sm font-medium text-capx-dark-box-bg">{label}</label>}
        <div className="relative items-center">
          <input
            ref={ref}
            className={`
              px-4 
              py-2 
              text-[20px]
              bg-transparent
              border 
              border-capx-gray-200
              rounded-lg 
              focus:outline-none 
              focus:ring-2 
              focus:ring-capx-primary-green 
              focus:border-transparent
              placeholder:text-capx-gray-400
              ${error ? 'border-red-500' : ''}
              ${icon && iconPosition === 'left' ? 'pl-12' : ''}
              ${icon && iconPosition === 'right' ? 'pr-12' : ''}
              ${className}
              ${customClass}
            `}
            {...props}
          />
          {icon && (
            <div
              className={`absolute ${
                iconPosition === 'left' ? 'left-3' : 'right-3'
              } top-1/2 transform -translate-y-1/2`}
            >
              <div className="relative w-[32px] h-[32px]">
                <Image src={icon} alt={label || ''} fill priority />
              </div>
            </div>
          )}
        </div>
        {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
      </div>
    );
  }
);

BaseInput.displayName = 'BaseInput';

export default BaseInput;

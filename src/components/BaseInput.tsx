'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { usePageContent } from '@/stores';
import Image from 'next/image';

interface BaseInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  customClass?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  size?: 'small' | 'default' | 'large';
}

const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  (
    {
      label,
      error,
      className = '',
      customClass = '',
      icon,
      iconPosition = 'right',
      size = 'default',
      ...props
    },
    ref
  ) => {
    const pageContent = usePageContent();

    // Size-based styles
    const sizeStyles = {
      small: {
        padding: 'px-3 py-2',
        fontSize: 'text-sm',
        iconSize: 'w-[20px] h-[20px]',
        iconPadding: { left: 'pl-10', right: 'pr-10' },
        iconPosition: { left: 'left-2', right: 'right-2' },
      },
      default: {
        padding: 'px-4 py-2',
        fontSize: 'text-[20px]',
        iconSize: 'w-[32px] h-[32px]',
        iconPadding: { left: 'pl-12', right: 'pr-12' },
        iconPosition: { left: 'left-3', right: 'right-3' },
      },
      large: {
        padding: 'px-6 py-3',
        fontSize: 'text-[24px]',
        iconSize: 'w-[40px] h-[40px]',
        iconPadding: { left: 'pl-16', right: 'pr-16' },
        iconPosition: { left: 'left-4', right: 'right-4' },
      },
    };

    const currentSize = sizeStyles[size];

    return (
      <div className="flex flex-col w-full">
        {label && (
          <label className="mb-2 text-sm font-medium text-capx-dark-box-bg">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative items-center">
          <input
            ref={ref}
            className={`
              ${currentSize.padding}
              ${currentSize.fontSize}
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
              ${icon && iconPosition === 'left' ? currentSize.iconPadding.left : ''}
              ${icon && iconPosition === 'right' ? currentSize.iconPadding.right : ''}
              ${className}
              ${customClass}
            `}
            aria-label={label}
            aria-required={props.required}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          {icon && (
            <div
              className={`absolute ${
                iconPosition === 'left'
                  ? currentSize.iconPosition.left
                  : currentSize.iconPosition.right
              } top-1/2 transform -translate-y-1/2`}
            >
              <div className={`relative ${currentSize.iconSize}`}>
                <Image
                  src={icon}
                  alt={pageContent['alt-icon-generic'] || 'Field icon'}
                  fill
                  priority
                />
              </div>
            </div>
          )}
        </div>
        {error && (
          <span
            id={`${props.id}-error`}
            className="mt-1 text-sm text-red-500"
            role="alert"
            aria-live="polite"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

BaseInput.displayName = 'BaseInput';

export default BaseInput;

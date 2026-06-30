'use client';

import { useState } from 'react';
import BaseButton from '@/components/BaseButton';
import { MentorshipForm, MentorshipFormField } from '@/types/mentorship';
import Image from 'next/image';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import { useDarkMode, usePageContent } from '@/stores';

/** Only limits the year when it has more than 4 digits; does not change 1–4 digits (allows typing 2025 etc.). */
function sanitizeDateValue(value: string | undefined): string {
  if (value == null || value === '') return value ?? '';
  const match = String(value).match(/^(\d{5,})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  const yearStr = match[1].slice(0, 4);
  let year = parseInt(yearStr, 10);
  if (year > 9999) year = 9999;
  if (year < 1) year = 1;
  return `${String(year).padStart(4, '0')}-${match[2]}-${match[3]}`;
}

/** Same rule for datetime-local: only sanitizes when the year has more than 4 digits. */
function sanitizeDateTimeValue(value: string | undefined): string {
  if (value == null || value === '') return value ?? '';
  const match = String(value).match(/^(\d{5,})-(\d{2})-(\d{2})T(.+)$/);
  if (!match) return value;
  const yearStr = match[1].slice(0, 4);
  let year = parseInt(yearStr, 10);
  if (year > 9999) year = 9999;
  if (year < 1) year = 1;
  return `${String(year).padStart(4, '0')}-${match[2]}-${match[3]}T${match[4]}`;
}

const validateStringConstraints = (field: MentorshipFormField, value: string): string | null => {
  const { minLength, maxLength, pattern } = field.validation ?? {};
  if (minLength && value.length < minLength) {
    return `${field.label} must be at least ${minLength} characters`;
  }
  if (maxLength && value.length > maxLength) {
    return `${field.label} must be at most ${maxLength} characters`;
  }
  if (pattern && !new RegExp(pattern).test(value)) {
    return `${field.label} format is invalid`;
  }
  return null;
};

const validateNumberConstraints = (field: MentorshipFormField, value: number): string | null => {
  const { min, max } = field.validation ?? {};
  if (min !== undefined && value < min) {
    return `${field.label} must be at least ${min}`;
  }
  if (max !== undefined && value > max) {
    return `${field.label} must be at most ${max}`;
  }
  return null;
};

// Shared input className: red border on error, otherwise theme-aware colors
const fieldInputClass = (error: string | undefined, darkMode: boolean): string =>
  `w-full px-4 py-3 rounded-lg border ${
    error
      ? 'border-red-500'
      : darkMode
        ? 'bg-gray-700 border-gray-600 text-white'
        : 'bg-white border-gray-300 text-gray-900'
  } focus:outline-none focus:ring-2 focus:ring-[#053749]`;

// Shared field wrapper: label + control (children) + error + hint
function FieldShell({
  field,
  error,
  darkMode,
  children,
}: {
  field: MentorshipFormField;
  error: string | undefined;
  darkMode: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label
        className={`block mb-2 text-sm font-semibold ${
          darkMode ? 'text-white' : 'text-capx-dark-box-bg'
        }`}
      >
        {field.label}
        {field.required !== false && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {field.hint && (
        <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {field.hint}
        </p>
      )}
    </div>
  );
}

interface DynamicFormProps {
  form: MentorshipForm;
  programName: string;
  programLogo: string | null;
  onSubmit: (data: Record<string, any>) => void;
  onClose: () => void;
  submitting?: boolean;
}

export default function DynamicForm({
  form,
  programName,
  programLogo,
  onSubmit,
  onClose,
  submitting = false,
}: DynamicFormProps) {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    form.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initial[field.id] = field.defaultValue;
      } else if (field.type === 'multiselect') {
        initial[field.id] = [];
      } else {
        initial[field.id] = '';
      }
    });
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const normalizedLogo =
    programLogo && programLogo.trim() !== '' ? formatWikiImageUrl(programLogo) : null;

  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const isEmpty = (v: any, _field: MentorshipFormField): boolean => {
    if (v == null) return true;
    if (Array.isArray(v)) return v.length === 0;
    if (typeof v === 'string') return v.trim() === '';
    return false;
  };

  const validateField = (field: MentorshipFormField, value: any): string | null => {
    const required = field.required !== false;
    if (required && isEmpty(value, field)) {
      return `${field.label} is required`;
    }

    if (isEmpty(value, field) && !required) return null;
    if (!field.validation) return null;

    if (typeof value === 'string') return validateStringConstraints(field, value);
    if (typeof value === 'number') return validateNumberConstraints(field, value);

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.fields.length === 0) return;

    const newErrors: Record<string, string> = {};
    form.fields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const renderField = (field: MentorshipFormField) => {
    const rawValue = formData[field.id];
    const value =
      field.type === 'multiselect' ? (Array.isArray(rawValue) ? rawValue : []) : (rawValue ?? '');
    const error = errors[field.id];
    const inputClass = fieldInputClass(error, darkMode);
    const shellProps = { field, error, darkMode };

    switch (field.type) {
      case 'textarea':
        return (
          <FieldShell key={field.id} {...shellProps}>
            <textarea
              value={value}
              onChange={e => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required !== false}
              rows={4}
              className={inputClass}
            />
          </FieldShell>
        );

      case 'select':
        return (
          <FieldShell key={field.id} {...shellProps}>
            <select
              value={value}
              onChange={e => handleChange(field.id, e.target.value)}
              required={field.required !== false}
              className={inputClass}
            >
              <option value="">{field.placeholder || 'Select...'}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FieldShell>
        );

      case 'multiselect':
        return (
          <FieldShell key={field.id} {...shellProps}>
            <div className="space-y-2">
              {field.options?.map((option, optIndex) => {
                const optValue = String(option.value);
                const isChecked = value.some(v => String(v) === optValue);
                const valueWithoutOption = value.filter(v => String(v) !== optValue);
                return (
                  <label
                    key={`${field.id}-opt-${optIndex}`}
                    className={`flex items-center gap-2 cursor-pointer ${
                      darkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        const newValue = isChecked ? valueWithoutOption : [...value, option.value];
                        handleChange(field.id, newValue);
                      }}
                      className="w-4 h-4 rounded border-gray-400 text-[#053749] focus:ring-[#053749]"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
            {!field.options?.length && (
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No options defined for this field.
              </p>
            )}
          </FieldShell>
        );

      case 'time':
        return (
          <FieldShell key={field.id} {...shellProps}>
            <input
              type="time"
              value={value}
              onChange={e => handleChange(field.id, e.target.value)}
              required={field.required !== false}
              className={inputClass}
            />
          </FieldShell>
        );

      case 'date':
        return (
          <FieldShell key={field.id} {...shellProps}>
            <input
              type="date"
              min="1000-01-01"
              max="9999-12-31"
              value={sanitizeDateValue(value)}
              onChange={e => handleChange(field.id, sanitizeDateValue(e.target.value))}
              required={field.required !== false}
              className={inputClass}
            />
          </FieldShell>
        );

      case 'datetime':
        return (
          <FieldShell key={field.id} {...shellProps}>
            <input
              type="datetime-local"
              min="1000-01-01T00:00"
              max="9999-12-31T23:59"
              value={sanitizeDateTimeValue(value)}
              onChange={e => handleChange(field.id, sanitizeDateTimeValue(e.target.value))}
              required={field.required !== false}
              className={inputClass}
            />
          </FieldShell>
        );

      default:
        return (
          <FieldShell key={field.id} {...shellProps}>
            <input
              type={field.type}
              value={value}
              onChange={e => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required !== false}
              className={inputClass}
            />
          </FieldShell>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative w-full max-w-lg md:max-w-2xl mx-auto max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
          darkMode
            ? 'bg-capx-dark-box-bg border border-gray-700'
            : 'bg-white border border-gray-200'
        }`}
      >
        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Logo */}
          {programLogo && programLogo.trim() !== '' && (
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20">
                <Image src={normalizedLogo!} alt={programName} fill className="object-contain" />
              </div>
            </div>
          )}

          {/* Title */}
          <div className="flex items-center justify-center mb-2">
            <h2
              className={`text-xl md:text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-capx-dark-box-bg'
              }`}
            >
              {form.role === 'mentor' ? 'Mentor form' : 'Mentee form'}
            </h2>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">{form.fields.map(renderField)}</div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <BaseButton
              type="button"
              onClick={onClose}
              customClass={`flex-1 px-4 py-2 rounded-lg text-sm font-extrabold border-2 border-[#053749] ${
                darkMode
                  ? 'bg-transparent text-white hover:bg-[#053749] hover:text-white'
                  : 'bg-white text-[#053749] hover:bg-[#053749] hover:text-white'
              }`}
              label={pageContent['close'] || 'Close'}
            />
            <BaseButton
              type="submit"
              disabled={submitting}
              customClass="flex-1 px-4 py-2 rounded-lg text-sm font-extrabold bg-[#851970] hover:bg-[#6A1B9A] text-white disabled:opacity-60 disabled:cursor-not-allowed"
              label={
                submitting
                  ? pageContent['submitting'] || 'Submitting...'
                  : form.submitButtonLabel || pageContent['subscribe'] || 'Subscribe'
              }
            />
          </div>
        </form>
      </div>
    </div>
  );
}

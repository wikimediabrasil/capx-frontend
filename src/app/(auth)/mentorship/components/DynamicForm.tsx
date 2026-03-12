'use client';

import { useState } from 'react';
import BaseButton from '@/components/BaseButton';
import { MentorshipForm, MentorshipFormField } from '@/types/mentorship';
import Image from 'next/image';
import MentorIcon from '@/public/static/images/mentor.svg';
import MenteeIcon from '@/public/static/images/mentee.svg';

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

  const isEmpty = (v: any, field: MentorshipFormField): boolean => {
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

    if (field.validation) {
      const { min, max, minLength, maxLength, pattern } = field.validation;

      if (typeof value === 'string') {
        if (minLength && value.length < minLength) {
          return `${field.label} must be at least ${minLength} characters`;
        }
        if (maxLength && value.length > maxLength) {
          return `${field.label} must be at most ${maxLength} characters`;
        }
        if (pattern) {
          const regex = new RegExp(pattern);
          if (!regex.test(value)) {
            return `${field.label} format is invalid`;
          }
        }
      }

      if (typeof value === 'number') {
        if (min !== undefined && value < min) {
          return `${field.label} must be at least ${min}`;
        }
        if (max !== undefined && value > max) {
          return `${field.label} must be at most ${max}`;
        }
      }
    }

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

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="mb-4">
            <label
              className={`block mb-2 text-sm font-semibold ${
                darkMode ? 'text-white' : 'text-capx-dark-box-bg'
              }`}
            >
              {field.label}
              {field.required !== false && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={e => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required !== false}
              rows={4}
              className={`w-full px-4 py-3 rounded-lg border ${
                error
                  ? 'border-red-500'
                  : darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#053749]`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            {field.hint && (
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {field.hint}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="mb-4">
            <label
              className={`block mb-2 text-sm font-semibold ${
                darkMode ? 'text-white' : 'text-capx-dark-box-bg'
              }`}
            >
              {field.label}
              {field.required !== false && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={e => handleChange(field.id, e.target.value)}
              required={field.required !== false}
              className={`w-full px-4 py-3 rounded-lg border ${
                error
                  ? 'border-red-500'
                  : darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#053749]`}
            >
              <option value="">{field.placeholder || 'Select...'}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            {field.hint && (
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {field.hint}
              </p>
            )}
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.id} className="mb-4">
            <label
              className={`block mb-2 text-sm font-semibold ${
                darkMode ? 'text-white' : 'text-capx-dark-box-bg'
              }`}
            >
              {field.label}
              {field.required !== false && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option, optIndex) => {
                const optValue = String(option.value);
                const isChecked = value.some(v => String(v) === optValue);
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
                        const newValue = isChecked
                          ? value.filter(v => String(v) !== optValue)
                          : [...value, option.value];
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
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            {field.hint && (
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {field.hint}
              </p>
            )}
          </div>
        );

      case 'time':
        return (
          <div key={field.id} className="mb-4">
            <label
              className={`block mb-2 text-sm font-semibold ${
                darkMode ? 'text-white' : 'text-capx-dark-box-bg'
              }`}
            >
              {field.label}
              {field.required !== false && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="time"
              value={value}
              onChange={e => handleChange(field.id, e.target.value)}
              required={field.required !== false}
              className={`w-full px-4 py-3 rounded-lg border ${
                error
                  ? 'border-red-500'
                  : darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#053749]`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            {field.hint && (
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {field.hint}
              </p>
            )}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="mb-4">
            <label
              className={`block mb-2 text-sm font-semibold ${
                darkMode ? 'text-white' : 'text-capx-dark-box-bg'
              }`}
            >
              {field.label}
              {field.required !== false && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              min="1000-01-01"
              max="9999-12-31"
              value={sanitizeDateValue(value)}
              onChange={e => handleChange(field.id, sanitizeDateValue(e.target.value))}
              required={field.required !== false}
              className={`w-full px-4 py-3 rounded-lg border ${
                error
                  ? 'border-red-500'
                  : darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#053749]`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            {field.hint && (
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {field.hint}
              </p>
            )}
          </div>
        );

      case 'datetime':
        return (
          <div key={field.id} className="mb-4">
            <label
              className={`block mb-2 text-sm font-semibold ${
                darkMode ? 'text-white' : 'text-capx-dark-box-bg'
              }`}
            >
              {field.label}
              {field.required !== false && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="datetime-local"
              min="1000-01-01T00:00"
              max="9999-12-31T23:59"
              value={sanitizeDateTimeValue(value)}
              onChange={e => handleChange(field.id, sanitizeDateTimeValue(e.target.value))}
              required={field.required !== false}
              className={`w-full px-4 py-3 rounded-lg border ${
                error
                  ? 'border-red-500'
                  : darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#053749]`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            {field.hint && (
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {field.hint}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.id} className="mb-4">
            <label
              className={`block mb-2 text-sm font-semibold ${
                darkMode ? 'text-white' : 'text-capx-dark-box-bg'
              }`}
            >
              {field.label}
              {field.required !== false && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={e => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required !== false}
              className={`w-full px-4 py-3 rounded-lg border ${
                error
                  ? 'border-red-500'
                  : darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#053749]`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            {field.hint && (
              <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {field.hint}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
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
                <Image src={programLogo} alt={programName} fill className="object-contain" />
              </div>
            </div>
          )}

          {/* Title */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="relative w-6 h-6 md:w-8 md:h-8">
              <Image
                src={form.role === 'mentor' ? MentorIcon : MenteeIcon}
                alt={form.role === 'mentor' ? 'Mentor' : 'Mentee'}
                fill
                className="object-contain"
              />
            </div>
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

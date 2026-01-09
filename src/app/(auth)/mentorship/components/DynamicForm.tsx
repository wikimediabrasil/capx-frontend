'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import BaseButton from '@/components/BaseButton';
import { MentorshipForm, MentorshipFormField } from '@/types/mentorship';
import Image from 'next/image';
import MentorIcon from '@/public/static/images/mentor.svg';
import MenteeIcon from '@/public/static/images/mentee.svg';

interface DynamicFormProps {
  form: MentorshipForm;
  programName: string;
  programLogo: string | null;
  onSubmit: (data: Record<string, any>) => void;
  onClose: () => void;
}

export default function DynamicForm({
  form,
  programName,
  programLogo,
  onSubmit,
  onClose,
}: DynamicFormProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
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

  const validateField = (field: MentorshipFormField, value: any): string | null => {
    if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
      return `${field.label} is required`;
    }

    if (!value && !field.required) return null;

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
    const value = formData[field.id] || '';
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
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={e => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
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
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={e => handleChange(field.id, e.target.value)}
              required={field.required}
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
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {Array.isArray(value) &&
                value.map((selectedValue, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {field.options?.find(opt => opt.value === selectedValue)?.label ||
                      selectedValue}
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = value.filter((_, i) => i !== index);
                        handleChange(field.id, newValue);
                      }}
                      className="ml-1 hover:opacity-70"
                    >
                      ×
                    </button>
                  </span>
                ))}
            </div>
            <select
              value=""
              onChange={e => {
                if (e.target.value) {
                  const currentValues = Array.isArray(value) ? value : [];
                  if (!currentValues.includes(e.target.value)) {
                    handleChange(field.id, [...currentValues, e.target.value]);
                  }
                  e.target.value = '';
                }
              }}
              className={`w-full px-4 py-3 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#053749]`}
            >
              <option value="">{field.placeholder || 'Select...'}</option>
              {field.options
                ?.filter(opt => !Array.isArray(value) || !value.includes(opt.value))
                .map(option => (
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

      case 'time':
        return (
          <div key={field.id} className="mb-4">
            <label
              className={`block mb-2 text-sm font-semibold ${
                darkMode ? 'text-white' : 'text-capx-dark-box-bg'
              }`}
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="time"
              value={value}
              onChange={e => handleChange(field.id, e.target.value)}
              required={field.required}
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
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={e => handleChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
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
              customClass={`flex-1 px-4 py-2 rounded-lg text-sm font-extrabold border-2 border-[#053749] text-[#053749] ${
                darkMode
                  ? 'bg-transparent hover:bg-[#053749] hover:text-white'
                  : 'bg-white hover:bg-[#053749] hover:text-white'
              }`}
              label={pageContent['close'] || 'Close'}
            />
            <BaseButton
              type="submit"
              customClass="flex-1 px-4 py-2 rounded-lg text-sm font-extrabold bg-[#851970] hover:bg-[#6A1B9A] text-white"
              label={form.submitButtonLabel || pageContent['subscribe'] || 'Subscribe'}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

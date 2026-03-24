'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import BaseButton from '@/components/BaseButton';
import { MentorshipForm } from '@/types/mentorship';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import { useDarkMode, usePageContent } from '@/stores';

interface NativeFormRenderModalProps {
  form: MentorshipForm;
  programName: string;
  programLogo: string | null;
  onSubmit: (data: Record<string, unknown>) => void;
  onClose: () => void;
  submitting?: boolean;
}

function appendValue(
  target: Record<string, unknown>,
  key: string,
  value: FormDataEntryValue
): void {
  const normalizedKey = key.endsWith('[]') ? key.slice(0, -2) : key;
  const normalizedValue = typeof value === 'string' ? value : value.name;

  if (Object.prototype.hasOwnProperty.call(target, normalizedKey)) {
    const current = target[normalizedKey];
    if (Array.isArray(current)) {
      target[normalizedKey] = [...current, normalizedValue];
    } else {
      target[normalizedKey] = [current as string, normalizedValue];
    }
    return;
  }

  target[normalizedKey] = normalizedValue;
}

export default function NativeFormRenderModal({
  form,
  programName,
  programLogo,
  onSubmit,
  onClose,
  submitting = false,
}: NativeFormRenderModalProps) {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();
  const [isReady, setIsReady] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const nativeFormRef = useRef<HTMLFormElement | null>(null);

  const normalizedLogo = useMemo(
    () => (programLogo && programLogo.trim() !== '' ? formatWikiImageUrl(programLogo) : null),
    [programLogo]
  );

  useEffect(() => {
    let cancelled = false;

    async function renderNativeForm() {
      setIsReady(false);
      setRenderError(null);

      if (!form.rawJson || form.rawJson.length === 0) {
        setRenderError('No form schema available');
        return;
      }

      try {
        const jqueryModule = await import('jquery');
        const $ = (jqueryModule.default || jqueryModule) as any;
        const win = window as Window & { jQuery?: any; $?: any };

        win.jQuery = $;
        win.$ = $;

        await import('formBuilder/dist/form-render.min.js');

        if (cancelled || !formContainerRef.current) return;

        const $container = $(formContainerRef.current);
        $container.empty();
        $container.formRender({
          formData: JSON.stringify(form.rawJson),
          dataType: 'json',
        });

        if (!cancelled) {
          setIsReady(true);
        }
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : 'Failed to render native form';
        setRenderError(message);
      }
    }

    renderNativeForm();

    return () => {
      cancelled = true;
    };
  }, [form.rawJson]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nativeFormRef.current) return;
    if (!nativeFormRef.current.reportValidity()) return;

    const data: Record<string, unknown> = {};
    const formData = new FormData(nativeFormRef.current);

    for (const [key, value] of formData.entries()) {
      appendValue(data, key, value);
    }

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

      <div
        className={`relative w-full max-w-lg md:max-w-2xl mx-auto max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
          darkMode
            ? 'bg-capx-dark-box-bg border border-gray-700'
            : 'bg-white border border-gray-200'
        }`}
      >
        <form ref={nativeFormRef} onSubmit={handleSubmit} className="p-6">
          {programLogo && programLogo.trim() !== '' && (
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20">
                <Image src={normalizedLogo!} alt={programName} fill className="object-contain" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-center mb-4">
            <h2
              className={`text-xl md:text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-capx-dark-box-bg'
              }`}
            >
              {form.role === 'mentor' ? 'Mentor form' : 'Mentee form'}
            </h2>
          </div>

          {renderError ? (
            <p className="mb-4 text-sm text-red-600">{renderError}</p>
          ) : (
            <div
              ref={formContainerRef}
              className={`${darkMode ? 'text-white native-form-render-dark' : 'text-capx-dark-box-bg'} native-form-render`}
            />
          )}

          {!isReady && !renderError && (
            <p className={`mt-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {pageContent['loading'] || 'Loading...'}
            </p>
          )}

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
              disabled={submitting || !isReady || !!renderError}
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

      <style jsx global>{`
        .native-form-render .form-group,
        .native-form-render .formbuilder-text,
        .native-form-render .formbuilder-textarea,
        .native-form-render .formbuilder-select,
        .native-form-render .formbuilder-date,
        .native-form-render .formbuilder-checkbox-group,
        .native-form-render .formbuilder-radio-group {
          margin-bottom: 1rem;
        }

        .native-form-render label {
          display: inline-block;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
          font-weight: 600;
        }

        .native-form-render h1,
        .native-form-render h2,
        .native-form-render h3,
        .native-form-render h4,
        .native-form-render h5,
        .native-form-render h6 {
          margin: 0 0 0.65rem;
          line-height: 1.25;
          font-weight: 700;
          color: inherit;
        }

        .native-form-render h1 {
          font-size: 1.6rem;
        }

        .native-form-render h2 {
          font-size: 1.4rem;
        }

        .native-form-render h3 {
          font-size: 1.2rem;
        }

        .native-form-render h4 {
          font-size: 1.1rem;
        }

        .native-form-render h5 {
          font-size: 1rem;
        }

        .native-form-render h6 {
          font-size: 0.9rem;
        }

        .native-form-render input[type='text'],
        .native-form-render input[type='email'],
        .native-form-render input[type='number'],
        .native-form-render input[type='tel'],
        .native-form-render input[type='date'],
        .native-form-render input[type='time'],
        .native-form-render input[type='datetime-local'],
        .native-form-render textarea,
        .native-form-render select {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          background: #ffffff;
          color: #111827;
          line-height: 1.25rem;
          box-sizing: border-box;
        }

        .native-form-render textarea {
          min-height: 7rem;
          resize: vertical;
        }

        .native-form-render input:focus,
        .native-form-render textarea:focus,
        .native-form-render select:focus {
          outline: none;
          border-color: #053749;
          box-shadow: 0 0 0 2px rgba(5, 55, 73, 0.2);
        }

        .native-form-render input[type='checkbox'],
        .native-form-render input[type='radio'] {
          accent-color: #0b708f;
          margin-right: 0.4rem;
        }

        .native-form-render .required {
          color: #ef4444;
          margin-left: 0.25rem;
        }

        .native-form-render.native-form-render-dark input[type='text'],
        .native-form-render.native-form-render-dark input[type='email'],
        .native-form-render.native-form-render-dark input[type='number'],
        .native-form-render.native-form-render-dark input[type='tel'],
        .native-form-render.native-form-render-dark input[type='date'],
        .native-form-render.native-form-render-dark input[type='time'],
        .native-form-render.native-form-render-dark input[type='datetime-local'],
        .native-form-render.native-form-render-dark textarea,
        .native-form-render.native-form-render-dark select {
          background: #374151;
          border-color: #4b5563;
          color: #ffffff;
        }

        .native-form-render.native-form-render-dark input::placeholder,
        .native-form-render.native-form-render-dark textarea::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}

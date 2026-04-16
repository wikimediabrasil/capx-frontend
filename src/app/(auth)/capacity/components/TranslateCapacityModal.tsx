'use client';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { translationService } from '@/services/translationService';
import { useDarkMode, useLanguage, usePageContent, useCapacityStore } from '@/stores';
import type { OAuthStatusResponse } from '@/types/translation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import MetabaseIcon from '@/public/static/images/metabase_black.svg';
import MetabaseLightIcon from '@/public/static/images/metabase_light.svg';
import { useCallback, useEffect, useRef, useState } from 'react';

interface TranslateCapacityModalProps {
  isOpen: boolean;
  onClose: () => void;
  capacityName: string;
  capacityCode?: number;
  qid?: string;
  metabaseCode?: string;
  fallbackLabel?: string;
  fallbackDescription?: string;
}

const OAUTH_POLL_INTERVAL_MS = 2500;
const OAUTH_TIMEOUT_MS = 90_000;

function getToken(session: ReturnType<typeof useSession>['data']): string | undefined {
  return (session?.user as { token?: string } | undefined)?.token;
}

export default function TranslateCapacityModal({
  isOpen,
  onClose,
  capacityName,
  capacityCode,
  qid,
  metabaseCode: _metabaseCode,
  fallbackLabel = '',
  fallbackDescription = '',
}: TranslateCapacityModalProps) {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();
  const language = useLanguage();
  const { showSnackbar } = useSnackbar();
  const { updateCapacityTranslation } = useCapacityStore();
  const { data: session } = useSession();
  const token = getToken(session);

  const [oauthStatus, setOauthStatus] = useState<OAuthStatusResponse | null>(null);
  const [oauthLoading, setOauthLoading] = useState(true);
  const [oauthConnecting, setOauthConnecting] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<Window | null>(null);

  const [label, setLabel] = useState(fallbackLabel);
  const [description, setDescription] = useState(fallbackDescription);
  const [isSaving, setIsSaving] = useState(false);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();

    pollIntervalRef.current = setInterval(async () => {
      if (popupRef.current?.closed) {
        stopPolling();
        setOauthConnecting(false);
        return;
      }
      try {
        const status = await translationService.getOAuthStatus(token);
        if (status.connected) {
          stopPolling();
          setOauthConnecting(false);
          setOauthStatus(status);
          popupRef.current?.close();
          showSnackbar(
            pageContent['translation-oauth-connected'] || 'Metabase account connected!',
            'success'
          );
        }
      } catch {
        // silent – keep polling
      }
    }, OAUTH_POLL_INTERVAL_MS);

    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
      setOauthConnecting(false);
      showSnackbar(
        pageContent['translation-oauth-timeout'] || 'Authorization timed out. Please try again.',
        'error'
      );
    }, OAUTH_TIMEOUT_MS);
  }, [token, stopPolling, showSnackbar, pageContent]);

  const checkOAuthStatus = useCallback(async () => {
    if (!token) {
      setOauthLoading(false);
      return;
    }
    try {
      const status = await translationService.getOAuthStatus(token);
      setOauthStatus(status);
    } catch {
      setOauthStatus({ connected: false, username: '' });
    } finally {
      setOauthLoading(false);
    }
  }, [token]);

  const handleConnect = useCallback(async () => {
    if (oauthConnecting) return;
    setOauthConnecting(true);
    try {
      const begin = await translationService.beginOAuth(token);
      const popup = window.open(
        begin.authorization_url,
        'metabase_oauth',
        'width=720,height=640,noopener'
      );
      popupRef.current = popup;
      startPolling();
    } catch (err) {
      setOauthConnecting(false);
      showSnackbar(err instanceof Error ? err.message : 'OAuth begin failed', 'error');
    }
  }, [oauthConnecting, token, startPolling, showSnackbar]);

  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      return;
    }
    setOauthLoading(true);
    setLabel(fallbackLabel);
    setDescription(fallbackDescription);
    checkOAuthStatus();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSave = async () => {
    if (!qid || !language || !token) return;
    setIsSaving(true);
    try {
      const result = await translationService.saveTranslation(
        qid,
        language,
        label,
        description,
        token
      );
      if (capacityCode !== undefined) {
        const labelChanged = result.changed.includes('label');
        const descriptionChanged = result.changed.includes('description');
        updateCapacityTranslation(
          capacityCode,
          label,
          description,
          labelChanged,
          descriptionChanged
        );
      }
      showSnackbar(
        pageContent['translate-capacity-save-success'] || 'Translation saved successfully!',
        'success'
      );
      onClose();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const isConnected = oauthStatus?.connected;
  const canSave = isConnected && !!qid && !!label.trim() && !isSaving;

  return (
    <dialog
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      aria-modal="true"
      aria-labelledby="translate-capacity-modal-title"
    >
      <div
        className={`rounded-lg shadow-lg p-6 w-full max-w-lg flex flex-col gap-5 ${
          darkMode ? 'bg-capx-dark-bg' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="translate-capacity-modal-title"
              className={`text-xl font-extrabold font-Montserrat ${
                darkMode ? 'text-white' : 'text-capx-dark-box-bg'
              }`}
            >
              {pageContent['translate-capacity-modal-title'] || 'Add Translation'}
            </h2>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {capacityName}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`text-xl opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Language indicator */}
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {pageContent['translate-capacity-target-language'] || 'Translating to:'}{' '}
          <strong className={darkMode ? 'text-white' : 'text-capx-dark-box-bg'}>{language}</strong>
        </p>

        {/* OAuth section */}
        <div
          className={`rounded-lg p-4 flex flex-col gap-3 ${
            darkMode ? 'bg-capx-dark-box-bg' : 'bg-gray-50 border border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image src={darkMode ? MetabaseLightIcon : MetabaseIcon} alt="Metabase" fill />
            </div>
            <span
              className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}
            >
              {pageContent['translation-metabase-connection'] || 'Metabase Account'}
            </span>
          </div>

          {oauthLoading ? (
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {pageContent['loading'] || 'Loading...'}
            </p>
          ) : isConnected ? (
            <p className={`text-sm ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
              ✓ {pageContent['translation-oauth-connected-as'] || 'Connected as'}{' '}
              <strong>{oauthStatus?.username}</strong>
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {pageContent['translation-oauth-required'] ||
                  'Connect your Metabase account to contribute translations.'}
              </p>
              <button
                onClick={handleConnect}
                disabled={oauthConnecting}
                className="self-start px-4 py-2 bg-capx-dark-box-bg text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {oauthConnecting
                  ? pageContent['translation-oauth-connecting'] || 'Connecting...'
                  : pageContent['translation-oauth-connect'] || 'Connect Metabase'}
              </button>
            </div>
          )}
        </div>

        {/* Label field */}
        <div>
          <label
            htmlFor="translate-capacity-label"
            className={`block font-bold mb-1 text-sm ${darkMode ? 'text-white' : 'text-[#507380]'}`}
          >
            {pageContent['translate-capacity-label'] || 'Title'}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="translate-capacity-label"
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            maxLength={200}
            disabled={!isConnected}
            className={`w-full rounded px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-capx-dark-box-bg disabled:opacity-50 ${
              darkMode
                ? 'bg-capx-dark-box-bg text-white border-gray-600'
                : 'bg-gray-100 text-capx-dark-box-bg border-gray-200'
            }`}
          />
          {fallbackLabel && (
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {pageContent['translate-capacity-original'] || 'Original (English):'} {fallbackLabel}
            </p>
          )}
        </div>

        {/* Description field */}
        <div>
          <label
            htmlFor="translate-capacity-description"
            className={`block font-bold mb-1 text-sm ${darkMode ? 'text-white' : 'text-[#507380]'}`}
          >
            {pageContent['translate-capacity-description'] || 'Description'}
          </label>
          <textarea
            id="translate-capacity-description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            maxLength={1000}
            disabled={!isConnected}
            className={`w-full rounded px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-capx-dark-box-bg resize-none disabled:opacity-50 ${
              darkMode
                ? 'bg-capx-dark-box-bg text-white border-gray-600'
                : 'bg-gray-100 text-capx-dark-box-bg border-gray-200'
            }`}
          />
          {fallbackDescription && (
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {pageContent['translate-capacity-original'] || 'Original (English):'}{' '}
              {fallbackDescription}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-4 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border font-extrabold text-sm bg-white text-capx-dark-box-bg border-capx-dark-box-bg disabled:opacity-50"
          >
            {pageContent['suggest-capacity-cancel'] || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-2 rounded-lg bg-capx-dark-box-bg text-white font-extrabold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isSaving
              ? pageContent['loading'] || 'Saving...'
              : pageContent['translate-capacity-save'] || 'Save Translation'}
          </button>
        </div>
      </div>
    </dialog>
  );
}

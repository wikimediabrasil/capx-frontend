'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useDarkMode, usePageContent } from '@/stores';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { translationService } from '@/services/translationService';
import type { EditableCapacityItem, OAuthStatusResponse } from '@/types/translation';

// Languages users can translate into (English excluded per spec)
const EDITABLE_LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'pt-br', label: 'Português (Brasil)' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh-hant', label: '繁體中文' },
  { code: 'zh-hans', label: '简体中文' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ru', label: 'Русский' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
];

const OAUTH_POLL_INTERVAL_MS = 2500;
const OAUTH_TIMEOUT_MS = 90_000;
const PENDING_REFRESH_DELAY_MS = 90_000;

function getToken(session: ReturnType<typeof useSession>['data']): string | undefined {
  return (session?.user as { token?: string } | undefined)?.token;
}

export default function TranslationWorkspace() {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();
  const { showSnackbar } = useSnackbar();
  const { data: session } = useSession();
  const token = getToken(session);

  // Language selection
  const [targetLang, setTargetLang] = useState('fr');
  const [fallbackLang] = useState('en');

  // OAuth state
  const [oauthStatus, setOauthStatus] = useState<OAuthStatusResponse | null>(null);
  const [oauthLoading, setOauthLoading] = useState(true);
  const [oauthConnecting, setOauthConnecting] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const popupRef = useRef<Window | null>(null);

  // Capacity list state
  const [items, setItems] = useState<EditableCapacityItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  // Derived stats
  const total = items.length;
  const withTranslation = items.filter(i => i.label !== null || i.description !== null).length;
  const changedCount = items.filter(i => i.dirty).length;

  // ------------------------------------------------------------------
  // OAuth helpers
  // ------------------------------------------------------------------
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
    if (!token) return;
    try {
      const status = await translationService.getOAuthStatus(token);
      setOauthStatus(status);
    } catch {
      setOauthStatus({ connected: false, username: '' });
    } finally {
      setOauthLoading(false);
    }
  }, [token]);

  const handleConnectMetabase = useCallback(async () => {
    if (oauthConnecting) return;
    setOauthError(null);
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OAuth begin failed';
      setOauthError(msg);
      setOauthConnecting(false);
    }
  }, [oauthConnecting, token, startPolling]);

  const handleDisconnect = useCallback(async () => {
    try {
      await translationService.disconnectOAuth(token);
      setOauthStatus({ connected: false, username: '' });
      showSnackbar(
        pageContent['translation-oauth-disconnected'] || 'Metabase account disconnected.',
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Disconnect failed';
      showSnackbar(msg, 'error');
    }
  }, [token, showSnackbar, pageContent]);

  // ------------------------------------------------------------------
  // Capacity list helpers
  // ------------------------------------------------------------------
  const loadCapacities = useCallback(async () => {
    if (!token) return;
    setListLoading(true);
    setListError(null);
    try {
      const results = await translationService.loadCapacities(targetLang, fallbackLang, token);
      setItems(
        results.map(item => ({
          ...item,
          editedLabel: item.label ?? '',
          editedDescription: item.description ?? '',
          rowStatus: 'idle',
          dirty: false,
        }))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load capacities';
      setListError(msg);
    } finally {
      setListLoading(false);
    }
  }, [token, targetLang, fallbackLang]);

  const handleSave = useCallback(
    async (qid: string) => {
      const idx = items.findIndex(i => i.qid === qid);
      if (idx === -1) return;
      const item = items[idx];

      setItems(prev =>
        prev.map(i => (i.qid === qid ? { ...i, rowStatus: 'saving' } : i))
      );

      try {
        await translationService.saveTranslation(
          qid,
          targetLang,
          item.editedLabel,
          item.editedDescription,
          token
        );
        setItems(prev =>
          prev.map(i =>
            i.qid === qid
              ? {
                  ...i,
                  label: i.editedLabel ?? i.label,
                  description: i.editedDescription ?? i.description,
                  rowStatus: 'pending',
                  dirty: false,
                }
              : i
          )
        );
        // Schedule silent status reset after cache propagation window
        setTimeout(() => {
          setItems(prev =>
            prev.map(i => (i.qid === qid && i.rowStatus === 'pending' ? { ...i, rowStatus: 'saved' } : i))
          );
        }, PENDING_REFRESH_DELAY_MS);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Save failed';
        showSnackbar(msg, 'error');
        setItems(prev => prev.map(i => (i.qid === qid ? { ...i, rowStatus: 'error' } : i)));
      }
    },
    [items, targetLang, token, showSnackbar]
  );

  const handleFieldChange = useCallback(
    (qid: string, field: 'editedLabel' | 'editedDescription', value: string) => {
      setItems(prev =>
        prev.map(i => {
          if (i.qid !== qid) return i;
          const updated = { ...i, [field]: value };
          updated.dirty =
            updated.editedLabel !== (i.label ?? '') ||
            updated.editedDescription !== (i.description ?? '');
          return updated;
        })
      );
    },
    []
  );

  // ------------------------------------------------------------------
  // Effects
  // ------------------------------------------------------------------
  useEffect(() => {
    checkOAuthStatus();
  }, [checkOAuthStatus]);

  useEffect(() => {
    loadCapacities();
  }, [loadCapacities]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  // ------------------------------------------------------------------
  // Render helpers
  // ------------------------------------------------------------------
  const bg = darkMode ? 'bg-capx-dark-bg text-white' : 'bg-[#F6F6F6] text-gray-900';
  const cardBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputBase = darkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';

  function rowStatusBadge(status: EditableCapacityItem['rowStatus']) {
    switch (status) {
      case 'saving':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
            {pageContent['translation-status-saving'] || 'Saving…'}
          </span>
        );
      case 'pending':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200">
            {pageContent['translation-status-pending'] || 'Pending'}
          </span>
        );
      case 'saved':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
            {pageContent['translation-status-saved'] || 'Saved'}
          </span>
        );
      case 'error':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
            {pageContent['translation-status-error'] || 'Error'}
          </span>
        );
      default:
        return null;
    }
  }

  return (
    <section className={`w-full min-h-screen pt-24 md:pt-8 ${bg}`}>
      <div className="mx-auto max-w-[1200px] px-4 flex flex-col gap-6 pb-16">
        {/* Page title */}
        <h1 className="text-2xl font-bold">
          {pageContent['translation-page-title'] || 'Translate Capacities'}
        </h1>

        {/* OAuth banner */}
        {!oauthLoading && (
          <div
            className={`rounded-lg border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 ${
              oauthStatus?.connected
                ? darkMode
                  ? 'border-green-700 bg-green-900/20'
                  : 'border-green-300 bg-green-50'
                : darkMode
                  ? 'border-yellow-700 bg-yellow-900/20'
                  : 'border-yellow-300 bg-yellow-50'
            }`}
          >
            {oauthStatus?.connected ? (
              <>
                <span className="text-sm">
                  {pageContent['translation-oauth-connected-as'] || 'Connected to Metabase as'}{' '}
                  <strong>{oauthStatus.username || 'your account'}</strong>.{' '}
                  {pageContent['translation-oauth-edits-attributed'] ||
                    'Edits will be attributed to you.'}
                </span>
                <button
                  onClick={handleDisconnect}
                  className="text-xs underline opacity-70 hover:opacity-100 sm:ml-auto whitespace-nowrap"
                >
                  {pageContent['translation-oauth-disconnect'] || 'Disconnect'}
                </button>
              </>
            ) : (
              <>
                <span className="text-sm">
                  {pageContent['translation-oauth-prompt'] ||
                    'Connect Metabase to attribute edits to your account.'}
                </span>
                <button
                  onClick={handleConnectMetabase}
                  disabled={oauthConnecting}
                  className="sm:ml-auto px-3 py-1.5 rounded text-sm font-medium bg-[#851970] text-white disabled:opacity-60 hover:bg-[#6d1460] transition-colors whitespace-nowrap"
                >
                  {oauthConnecting
                    ? pageContent['translation-oauth-waiting'] || 'Waiting for authorization…'
                    : pageContent['translation-oauth-connect'] || 'Connect Metabase'}
                </button>
                {oauthError && (
                  <span className="text-xs text-red-600">
                    {oauthError}
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* Controls row */}
        <div className={`rounded-lg border ${cardBg} px-4 py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-end`}>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide opacity-60">
              {pageContent['translation-label-target-language'] || 'Target language'}
            </label>
            <select
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
              className={`rounded border px-3 py-2 text-sm ${inputBase} focus:outline-none focus:ring-2 focus:ring-[#851970]`}
            >
              {EDITABLE_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.label} ({l.code})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadCapacities}
            disabled={listLoading}
            className="px-4 py-2 rounded text-sm font-medium bg-[#851970] text-white disabled:opacity-60 hover:bg-[#6d1460] transition-colors"
          >
            {listLoading
              ? pageContent['translation-loading'] || 'Loading…'
              : pageContent['translation-refresh'] || 'Refresh'}
          </button>

          <div className="sm:ml-auto text-sm opacity-70">
            {pageContent['translation-progress-summary'] || 'Translated'}: {withTranslation}/
            {total} &nbsp;·&nbsp; {pageContent['translation-changed'] || 'Unsaved'}: {changedCount}
          </div>
        </div>

        {/* List */}
        {listLoading ? (
          <div className="flex justify-center py-16">
            <div
              className="animate-spin h-8 w-8 rounded-full border-4 border-l-gray-300 border-r-gray-300 border-b-gray-300 border-t-[#851970]"
              aria-label="Loading"
            />
          </div>
        ) : listError ? (
          <div className="text-center py-12 text-red-600">
            <p>{listError}</p>
            <button
              onClick={loadCapacities}
              className="mt-4 px-4 py-2 rounded text-sm font-medium bg-[#851970] text-white hover:bg-[#6d1460] transition-colors"
            >
              {pageContent['translation-retry'] || 'Retry'}
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <p>{pageContent['translation-no-items'] || 'No capacities found.'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map(item => (
              <TranslationRow
                key={item.qid}
                item={item}
                darkMode={darkMode}
                cardBg={cardBg}
                inputBase={inputBase}
                pageContent={pageContent}
                onFieldChange={handleFieldChange}
                onSave={handleSave}
                statusBadge={rowStatusBadge(item.rowStatus)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Row sub-component
// ------------------------------------------------------------------
interface TranslationRowProps {
  item: EditableCapacityItem;
  darkMode: boolean;
  cardBg: string;
  inputBase: string;
  pageContent: Record<string, string>;
  onFieldChange: (qid: string, field: 'editedLabel' | 'editedDescription', value: string) => void;
  onSave: (qid: string) => void;
  statusBadge: React.ReactNode;
}

function TranslationRow({
  item,
  cardBg,
  inputBase,
  pageContent,
  onFieldChange,
  onSave,
  statusBadge,
}: TranslationRowProps) {
  const isSaving = item.rowStatus === 'saving';
  const canSave = item.dirty && !isSaving;

  return (
    <div className={`rounded-lg border ${cardBg} px-4 py-4`}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs font-mono opacity-50">{item.qid}</span>
        {statusBadge}
        {item.dirty && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
            {pageContent['translation-status-edited'] || 'Edited'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fallback column */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide opacity-50">
            {pageContent['translation-column-fallback'] || 'English (reference)'}
          </p>
          <div>
            <p className="text-xs opacity-50 mb-1">
              {pageContent['translation-field-label'] || 'Label'}
            </p>
            <p className="text-sm">{item.fallback_label || '—'}</p>
          </div>
          <div>
            <p className="text-xs opacity-50 mb-1">
              {pageContent['translation-field-description'] || 'Description'}
            </p>
            <p className="text-sm opacity-80">{item.fallback_description || '—'}</p>
          </div>
        </div>

        {/* Editable column */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide opacity-50">
            {pageContent['translation-column-target'] || 'Translation'}
          </p>
          <div>
            <p className="text-xs opacity-50 mb-1">
              {pageContent['translation-field-label'] || 'Label'}
            </p>
            <input
              type="text"
              value={item.editedLabel ?? ''}
              disabled={isSaving}
              onChange={e => onFieldChange(item.qid, 'editedLabel', e.target.value)}
              placeholder={item.fallback_label}
              className={`w-full rounded border px-3 py-1.5 text-sm ${inputBase} focus:outline-none focus:ring-2 focus:ring-[#851970] disabled:opacity-60 ${
                item.dirty && item.editedLabel !== (item.label ?? '')
                  ? 'border-purple-400'
                  : ''
              }`}
            />
          </div>
          <div>
            <p className="text-xs opacity-50 mb-1">
              {pageContent['translation-field-description'] || 'Description'}
            </p>
            <textarea
              value={item.editedDescription ?? ''}
              disabled={isSaving}
              onChange={e => onFieldChange(item.qid, 'editedDescription', e.target.value)}
              placeholder={item.fallback_description}
              rows={2}
              className={`w-full rounded border px-3 py-1.5 text-sm ${inputBase} focus:outline-none focus:ring-2 focus:ring-[#851970] disabled:opacity-60 resize-none ${
                item.dirty && item.editedDescription !== (item.description ?? '')
                  ? 'border-purple-400'
                  : ''
              }`}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => onSave(item.qid)}
              disabled={!canSave}
              className="px-4 py-1.5 rounded text-sm font-medium bg-[#851970] text-white disabled:opacity-40 hover:bg-[#6d1460] transition-colors"
            >
              {isSaving
                ? pageContent['translation-saving'] || 'Saving…'
                : pageContent['translation-save'] || 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

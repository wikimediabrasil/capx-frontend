'use client';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { translationService } from '@/services/translationService';
import { useDarkMode, usePageContent } from '@/stores';
import type { EditableCapacityItem, OAuthStatusResponse } from '@/types/translation';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TranslationBanner from './TranslationBanner';

const OAUTH_POLL_INTERVAL_MS = 2500;
const OAUTH_TIMEOUT_MS = 90_000;
const PENDING_REFRESH_DELAY_MS = 90_000;
const PAGE_SIZE = 20;

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
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [targetLang, setTargetLang] = useState('');
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

  // Search & pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Derived: filtered items
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      i =>
        i.fallback_label.toLowerCase().includes(q) ||
        i.fallback_description.toLowerCase().includes(q) ||
        (i.label ?? '').toLowerCase().includes(q) ||
        (i.description ?? '').toLowerCase().includes(q) ||
        i.qid.toLowerCase().includes(q)
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = useMemo(
    () => filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredItems, page]
  );

  // Reset to page 1 when search or language changes
  useEffect(() => {
    setPage(1);
  }, [search, targetLang]);

  // Derived stats (over full list, not just current page)
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
      const item = items.find(i => i.qid === qid);
      if (!item) return;

      setItems(prev => prev.map(i => (i.qid === qid ? { ...i, rowStatus: 'saving' } : i)));

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
        setTimeout(() => {
          setItems(prev =>
            prev.map(i =>
              i.qid === qid && i.rowStatus === 'pending' ? { ...i, rowStatus: 'saved' } : i
            )
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
    axios.get<string[]>('/api/language').then(res => {
      const langs = res.data.filter(l => l !== 'en');
      setAvailableLanguages(langs);
      if (langs.length > 0) setTargetLang(prev => prev || langs[0]);
    });
  }, []);

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
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            {pageContent['translation-status-saving'] || 'Saving…'}
          </span>
        );
      case 'pending':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
            {pageContent['translation-status-pending'] || 'Pending'}
          </span>
        );
      case 'saved':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            {pageContent['translation-status-saved'] || 'Saved'}
          </span>
        );
      case 'error':
        return (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
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

        <TranslationBanner/>
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
                {oauthError && <span className="text-xs text-red-600">{oauthError}</span>}
              </>
            )}
          </div>
        )}

        {/* Controls row */}
        <div
          className={`rounded-lg border ${cardBg} px-4 py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-end`}
        >
          {/* Language selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide opacity-60">
              {pageContent['translation-label-target-language'] || 'Target language'}
            </label>
            <select
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
              className={`rounded border px-3 py-2 text-sm ${inputBase} focus:outline-none focus:ring-2 focus:ring-[#851970]`}
            >
              {availableLanguages.map(code => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <label className="text-xs font-medium uppercase tracking-wide opacity-60">
              {pageContent['translation-label-search'] || 'Search'}
            </label>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={pageContent['translation-search-placeholder'] || 'Filter by label, description or QID…'}
              className={`w-full rounded border px-3 py-2 text-sm ${inputBase} focus:outline-none focus:ring-2 focus:ring-[#851970]`}
            />
          </div>

          {/* Refresh */}
          <button
            onClick={loadCapacities}
            disabled={listLoading}
            className="px-4 py-2 rounded text-sm font-medium bg-[#851970] text-white disabled:opacity-60 hover:bg-[#6d1460] transition-colors self-end"
          >
            {listLoading
              ? pageContent['translation-loading'] || 'Loading…'
              : pageContent['translation-refresh'] || 'Refresh'}
          </button>

          {/* Stats */}
          <div className="sm:ml-auto text-sm opacity-70 whitespace-nowrap self-end">
            {pageContent['translation-progress-summary'] || 'Translated'}: {withTranslation}/
            {total}&nbsp;·&nbsp;{pageContent['translation-changed'] || 'Unsaved'}: {changedCount}
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
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 opacity-60">
            <p>
              {search
                ? pageContent['translation-no-results'] || 'No capacities match your search.'
                : pageContent['translation-no-items'] || 'No capacities found.'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-3 text-sm underline opacity-70 hover:opacity-100"
              >
                {pageContent['translation-clear-search'] || 'Clear search'}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Result count when searching */}
            {search && (
              <p className="text-sm opacity-60">
                {filteredItems.length}{' '}
                {pageContent['translation-search-results'] || 'results'}
              </p>
            )}

            <div className="flex flex-col gap-4">
              {pagedItems.map(item => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                darkMode={darkMode}
                pageContent={pageContent}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ------------------------------------------------------------------
// Pagination sub-component
// ------------------------------------------------------------------
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  darkMode: boolean;
  pageContent: Record<string, string>;
}

function Pagination({ page, totalPages, onPageChange, darkMode, pageContent }: PaginationProps) {
  const btnBase =
    'px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-40';
  const btnActive = 'bg-[#851970] text-white';
  const btnInactive = darkMode
    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50';

  // Build page window: always show first, last, current ±1
  const pages: (number | '…')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
      <button
        className={`${btnBase} ${btnInactive}`}
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        ←
      </button>

      {pages.map((p, idx) =>
        p === '…' ? (
          <span key={`ellipsis-${idx}`} className="px-1 opacity-40 select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            className={`${btnBase} ${p === page ? btnActive : btnInactive}`}
            onClick={() => onPageChange(p as number)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className={`${btnBase} ${btnInactive}`}
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        →
      </button>

      <span className="text-xs opacity-50 ml-2">
        {pageContent['translation-page-of'] || 'Page'} {page} / {totalPages}
      </span>
    </div>
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
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
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
                item.dirty && item.editedLabel !== (item.label ?? '') ? 'border-purple-400' : ''
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

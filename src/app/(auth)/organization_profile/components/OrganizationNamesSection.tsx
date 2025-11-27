'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useOrganizationNames } from '@/hooks/useOrganizationNames';
import { useLanguageSelection } from '@/hooks/useLanguageSelection';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { OrganizationName } from '@/types/organization';
import Image from 'next/image';
import AddIcon from '@/public/static/images/add_dark.svg';
import AddIconWhite from '@/public/static/images/add.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import UserCircleIcon from '@/public/static/images/supervised_user_circle.svg';
import UserCircleIconWhite from '@/public/static/images/supervised_user_circle_white.svg';

interface OrganizationNamesSectionProps {
  organizationId: number;
}

export default function OrganizationNamesSection({ organizationId }: OrganizationNamesSectionProps) {
  const { darkMode } = useTheme();
  const { pageContent, language } = useApp();
  const { data: session } = useSession();
  const { showSnackbar } = useSnackbar();
  const token = session?.user?.token;

  const { names, isLoading, createName, updateName, deleteName } = useOrganizationNames({
    organizationId,
    token,
  });

  const { fetchLanguages } = useLanguageSelection();
  const [availableLanguages, setAvailableLanguages] = useState<Array<{ value: string; label: string }>>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newLanguageCode, setNewLanguageCode] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const loadLanguages = async () => {
      const languages = await fetchLanguages();
      setAvailableLanguages(languages);
    };
    loadLanguages();
  }, [fetchLanguages]);

  const handleAdd = async () => {
    if (!newLanguageCode || !newName.trim()) {
      showSnackbar(pageContent['organization-name-fields-required'] || 'Language and name are required', 'error');
      return;
    }

    // Check if language already exists
    if (names.some(n => n.language_code.toLowerCase() === newLanguageCode.toLowerCase())) {
      showSnackbar(
        pageContent['organization-name-already-exists'] || 'A name for this language already exists',
        'error'
      );
      return;
    }

    try {
      await createName(newLanguageCode, newName.trim());
      setIsAdding(false);
      setNewLanguageCode('');
      setNewName('');
      showSnackbar(
        pageContent['organization-name-added'] || 'Organization name added successfully',
        'success'
      );
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to add organization name', 'error');
    }
  };

  const handleUpdate = async (id: number, currentLanguageCode: string, currentName: string) => {
    if (!newLanguageCode || !newName.trim()) {
      showSnackbar(pageContent['organization-name-fields-required'] || 'Language and name are required', 'error');
      return;
    }

    // Check if another name with the same language exists
    if (
      newLanguageCode.toLowerCase() !== currentLanguageCode.toLowerCase() &&
      names.some(n => n.id !== id && n.language_code.toLowerCase() === newLanguageCode.toLowerCase())
    ) {
      showSnackbar(
        pageContent['organization-name-already-exists'] || 'A name for this language already exists',
        'error'
      );
      return;
    }

    try {
      await updateName(id, newLanguageCode, newName.trim());
      setEditingId(null);
      setNewLanguageCode('');
      setNewName('');
      showSnackbar(
        pageContent['organization-name-updated'] || 'Organization name updated successfully',
        'success'
      );
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to update organization name', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(pageContent['organization-name-delete-confirm'] || 'Are you sure you want to delete this name?')) {
      return;
    }

    try {
      await deleteName(id);
      showSnackbar(
        pageContent['organization-name-deleted'] || 'Organization name deleted successfully',
        'success'
      );
    } catch (error: any) {
      showSnackbar(error.message || 'Failed to delete organization name', 'error');
    }
  };

  const startEditing = (name: OrganizationName) => {
    setEditingId(name.id);
    setNewLanguageCode(name.language_code);
    setNewName(name.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setIsAdding(false);
    setNewLanguageCode('');
    setNewName('');
  };

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative w-8 h-8 md:w-[48px] md:h-[48px] flex-shrink-0">
          <Image
            src={darkMode ? UserCircleIconWhite : UserCircleIcon}
            alt="Organization names icon"
            fill
            className="object-contain"
          />
        </div>
        <h2 className={`font-[Montserrat] text-sm md:text-[24px] font-bold ${darkMode ? 'text-white' : 'text-[#053749]'}`}>
          {pageContent['organization-names-title'] || 'Organization Names (Translations)'}
        </h2>
      </div>

      <p className={`text-xs md:text-base mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
        {pageContent['organization-names-description'] ||
          'Add translations of your organization name in different languages. The name will be displayed based on the user\'s selected language.'}
      </p>

      {/* Existing names */}
      <div className="space-y-3 mb-4">
        {isLoading ? (
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
            {pageContent['loading'] || 'Loading...'}
          </p>
        ) : names.length === 0 ? (
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
            {pageContent['organization-names-none'] || 'No translations added yet.'}
          </p>
        ) : (
          names.map(name => (
            <div
              key={name.id}
              className={`flex items-center gap-2 p-3 rounded-md border ${
                darkMode
                  ? 'bg-capx-dark-box-bg border-gray-700'
                  : 'bg-white border-gray-300'
              }`}
            >
              {editingId === name.id ? (
                <>
                  <select
                    value={newLanguageCode}
                    onChange={e => setNewLanguageCode(e.target.value)}
                    className={`flex-1 p-2 rounded-md border text-sm ${
                      darkMode
                        ? 'bg-transparent border-gray-600 text-white'
                        : 'border-gray-300 text-gray-900'
                    }`}
                  >
                    {availableLanguages.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder={pageContent['organization-name-placeholder'] || 'Organization name'}
                    className={`flex-1 p-2 rounded-md border text-sm ${
                      darkMode
                        ? 'bg-transparent border-gray-600 text-white placeholder-gray-400'
                        : 'border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    onClick={() => handleUpdate(name.id, name.language_code, name.name)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {pageContent['save'] || 'Save'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      darkMode
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
                    }`}
                  >
                    {pageContent['cancel'] || 'Cancel'}
                  </button>
                </>
              ) : (
                <>
                  <span className={`flex-1 text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <span className="font-bold">{name.language_code.toUpperCase()}:</span> {name.name}
                  </span>
                  <button
                    onClick={() => startEditing(name)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      darkMode
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    {pageContent['edit'] || 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDelete(name.id)}
                    className="p-2 rounded-md hover:opacity-80"
                  >
                    <Image
                      src={darkMode ? CloseIconWhite : CloseIcon}
                      alt="Delete"
                      width={20}
                      height={20}
                    />
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add new name */}
      {isAdding ? (
        <div
          className={`flex flex-col md:flex-row gap-2 p-3 rounded-md border ${
            darkMode
              ? 'bg-capx-dark-box-bg border-gray-700'
              : 'bg-white border-gray-300'
          }`}
        >
          <select
            value={newLanguageCode}
            onChange={e => setNewLanguageCode(e.target.value)}
            className={`flex-1 p-2 rounded-md border text-sm ${
              darkMode
                ? 'bg-transparent border-gray-600 text-white'
                : 'border-gray-300 text-gray-900'
            }`}
          >
            <option value="">{pageContent['select-language'] || 'Select language'}</option>
            {availableLanguages
              .filter(lang => !names.some(n => n.language_code.toLowerCase() === lang.value.toLowerCase()))
              .map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
          </select>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder={pageContent['organization-name-placeholder'] || 'Organization name'}
            className={`flex-1 p-2 rounded-md border text-sm ${
              darkMode
                ? 'bg-transparent border-gray-600 text-white placeholder-gray-400'
                : 'border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            onClick={handleAdd}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              darkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {pageContent['add'] || 'Add'}
          </button>
          <button
            onClick={cancelEditing}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              darkMode
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
            }`}
          >
            {pageContent['cancel'] || 'Cancel'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
            darkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
          }`}
        >
          <Image
            src={darkMode ? AddIconWhite : AddIcon}
            alt="Add"
            width={20}
            height={20}
          />
          {pageContent['organization-name-add'] || 'Add Translation'}
        </button>
      )}
    </div>
  );
}


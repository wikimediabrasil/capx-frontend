import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useCapacityTranslations } from '@/hooks/useCapacityTranslations';
import { useTranslationSync } from '@/hooks/useTranslationSync';

/**
 * Componente de exemplo para demonstrar o uso do sistema de traduções das capacidades
 * Este componente mostra como as traduções são atualizadas automaticamente quando o idioma muda
 */
export function CapacityTranslationExample() {
  const { language, setLanguage } = useApp();
  const { getCapacity, isLoaded } = useCapacityCache();
  const { isLoading, error, refreshTranslations, getTranslatedCapacity } =
    useCapacityTranslations();

  // Ensure translations are applied when language changes
  useTranslationSync();

  // Exemplo de códigos de capacidade para demonstrar as traduções
  const exampleCapacityCodes = [36, 50, 56, 65, 74, 106];

  // Idiomas disponíveis para teste
  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ];

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleRefreshTranslations = async () => {
    try {
      await refreshTranslations();
      console.log('Traduções atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar traduções:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Sistema de Traduções das Capacidades
        </h2>
        <p className="text-gray-600 mb-4">
          Este componente demonstra como o sistema de traduções funciona automaticamente.
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Idioma Atual:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {availableLanguages.find(lang => lang.code === language)?.name || language}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            {isLoading ? (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                Carregando...
              </span>
            ) : (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Pronto
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {availableLanguages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                language === lang.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleRefreshTranslations}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Atualizando...' : 'Atualizar Traduções'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <strong>Erro:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exampleCapacityCodes.map(code => {
          const capacity = getCapacity(code);
          const translatedCapacity = getTranslatedCapacity(code);

          if (!capacity) return null;

          return (
            <div
              key={code}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Código: {code}
                </span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {capacity.wd_code ? `WD: ${capacity.wd_code}` : 'Sem WD'}
                </span>
              </div>

              <h4 className="font-medium text-gray-800 mb-1">
                {translatedCapacity?.name || capacity.name || `Capacity ${code}`}
              </h4>

              {translatedCapacity?.description && (
                <p className="text-sm text-gray-600">{translatedCapacity.description}</p>
              )}

              <div className="mt-2 text-xs text-gray-500">
                <span className="inline-block px-2 py-1 bg-gray-100 rounded">
                  {capacity.hasChildren ? 'Tem filhos' : 'Sem filhos'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">Como Funciona:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• As capacidades são carregadas do cache em inglês por padrão</li>
          <li>• Quando você muda o idioma, as traduções são buscadas automaticamente</li>
          <li>• O sistema tenta primeiro o Metabase, depois o Wikidata como fallback</li>
          <li>• As traduções são armazenadas em cache por idioma</li>
          <li>• Use o botão &quot;Atualizar Traduções&quot; para forçar uma atualização</li>
        </ul>
      </div>
    </div>
  );
}

import React from 'react';

/**
 * Guia de uso para os tamanhos de fonte padronizados
 *
 * Este componente serve como documentação e exemplo de como
 * usar as classes de tamanho de fonte padrão adicionadas ao Tailwind
 */
const FontSizeGuide: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Guia de Tamanhos de Fonte Padronizados</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Tamanhos Responsivos</h2>
        <p className="mb-4">
          Utilize estas classes para tamanhos de fonte que se ajustam automaticamente entre mobile e
          desktop.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">Classes responsivas</h3>
            <p className="capx-text-xs mb-3">capx-text-xs: 12px (mobile) → 14px (desktop)</p>
            <p className="capx-text-sm mb-3">capx-text-sm: 14px (mobile) → 16px (desktop)</p>
            <p className="capx-text-base mb-3">capx-text-base: 16px (mobile) → 18px (desktop)</p>
            <p className="capx-text-lg mb-3">capx-text-lg: 18px (mobile) → 20px (desktop)</p>
            <p className="capx-text-xl mb-3">capx-text-xl: 20px (mobile) → 24px (desktop)</p>
            <p className="capx-text-2xl mb-3">capx-text-2xl: 24px (mobile) → 32px (desktop)</p>
            <p className="capx-text-3xl mb-3">capx-text-3xl: 32px (mobile) → 36px (desktop)</p>
            <p className="capx-text-4xl mb-3">capx-text-4xl: 32px (mobile) → 48px (desktop)</p>
            <p className="capx-text-5xl mb-3">capx-text-5xl: 32px (mobile) → 72px (desktop)</p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">Uso Recomendado</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li className="capx-text-xs">
                capx-text-xs: Texto muito pequeno, legendas, notas de rodapé
              </li>
              <li className="capx-text-sm">capx-text-sm: Texto secundário, notas, alertas</li>
              <li className="capx-text-base">capx-text-base: Texto principal, parágrafos</li>
              <li className="capx-text-lg">capx-text-lg: Subtítulos menores</li>
              <li className="capx-text-xl">capx-text-xl: Subtítulos médios</li>
              <li className="capx-text-2xl">capx-text-2xl: Subtítulos grandes</li>
              <li className="capx-text-3xl">capx-text-3xl: Títulos de seções</li>
              <li className="capx-text-4xl">capx-text-4xl: Títulos principais</li>
              <li className="capx-text-5xl">capx-text-5xl: Títulos de destaque, hero sections</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Tamanhos Específicos por Dispositivo</h2>
        <p className="mb-4">
          Quando precisar de mais controle, use estas classes específicas para cada tamanho de tela.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">Mobile</h3>
            <p className="text-capx-font-size-mobile-sm mb-2">capx-font-size-mobile-sm: 12px</p>
            <p className="text-capx-font-size-mobile-md mb-2">capx-font-size-mobile-md: 14px</p>
            <p className="text-capx-font-size-mobile-lg mb-2">capx-font-size-mobile-lg: 16px</p>
            <p className="text-capx-font-size-mobile-xl mb-2">capx-font-size-mobile-xl: 18px</p>
            <p className="text-capx-font-size-mobile-2xl mb-2">capx-font-size-mobile-2xl: 20px</p>
            <p className="text-capx-font-size-mobile-3xl mb-2">capx-font-size-mobile-3xl: 24px</p>
            <p className="text-capx-font-size-mobile-4xl mb-2">capx-font-size-mobile-4xl: 32px</p>
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">Desktop</h3>
            <p className="text-capx-font-size-desktop-sm mb-2">capx-font-size-desktop-sm: 14px</p>
            <p className="text-capx-font-size-desktop-md mb-2">capx-font-size-desktop-md: 16px</p>
            <p className="text-capx-font-size-desktop-lg mb-2">capx-font-size-desktop-lg: 18px</p>
            <p className="text-capx-font-size-desktop-xl mb-2">capx-font-size-desktop-xl: 20px</p>
            <p className="text-capx-font-size-desktop-2xl mb-2">capx-font-size-desktop-2xl: 24px</p>
            <p className="text-capx-font-size-desktop-3xl mb-2">capx-font-size-desktop-3xl: 32px</p>
            <p className="text-capx-font-size-desktop-4xl mb-2">capx-font-size-desktop-4xl: 36px</p>
            <p className="text-capx-font-size-desktop-5xl mb-2">capx-font-size-desktop-5xl: 48px</p>
            <p className="text-capx-font-size-desktop-6xl mb-2">capx-font-size-desktop-6xl: 72px</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Exemplo de Uso em Componentes</h2>
        <div className="border rounded p-6">
          <header className="mb-8">
            <h1 className="capx-text-4xl font-extrabold mb-4">Título da Página</h1>
            <p className="capx-text-base text-gray-600">
              Subtítulo ou descrição da página usando o tamanho base.
            </p>
          </header>

          <section className="mb-8">
            <h2 className="capx-text-2xl font-bold mb-4">Seção do Componente</h2>
            <p className="capx-text-base mb-4">
              Texto principal usando o tamanho base para melhor legibilidade em parágrafos longos.
              Este é o tamanho recomendado para a maioria dos textos de conteúdo.
            </p>

            <div className="bg-gray-100 p-4 rounded mb-4">
              <p className="capx-text-sm text-gray-600">
                Informação secundária ou detalhes adicionais usando tamanho menor.
              </p>
            </div>

            <button className="bg-purple-600 text-white capx-text-sm py-2 px-4 rounded">
              Botão com texto pequeno
            </button>
          </section>

          <footer className="border-t pt-4">
            <p className="capx-text-xs text-gray-500">
              Texto de rodapé ou notas legais usando o menor tamanho.
            </p>
          </footer>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Melhores Práticas</h2>
        <ul className="list-disc pl-5 space-y-2 capx-text-base">
          <li>Prefira usar as classes responsivas (capx-text-*) para a maioria dos casos</li>
          <li>
            Use as classes específicas por dispositivo apenas quando precisar de controle total
            sobre os tamanhos
          </li>
          <li>Mantenha a consistência usando os mesmos tamanhos para elementos similares</li>
          <li>
            Combine com as classes de peso de fonte do Tailwind (font-normal, font-medium,
            font-bold, font-extrabold)
          </li>
          <li>
            Para elementos muito pequenos ou muito grandes, ajuste o line-height para melhor
            legibilidade
          </li>
        </ul>
      </section>
    </div>
  );
};

export default FontSizeGuide;

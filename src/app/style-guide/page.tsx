"use client";

import React from "react";
import FontSizeGuide from "@/components/FontSizeGuide";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";

export default function StyleGuidePage() {
  const { isMobile } = useApp();
  const { darkMode } = useTheme();

  return (
    <div
      className={
        darkMode
          ? "bg-capx-dark-bg text-white"
          : "bg-white text-capx-dark-box-bg"
      }
    >
      <div className="container mx-auto py-8 px-4">
        <header className="mb-12">
          <h1 className="capx-text-3xl font-extrabold mb-4">
            Guia de Estilos CAPX
          </h1>
          <p className="capx-text-lg">
            Este guia demonstra os padrões de design do sistema CAPX para
            garantir consistência visual.
          </p>
          <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded-md">
            <p className="capx-text-sm">
              <strong>Nota para desenvolvedores:</strong> Este guia está em
              desenvolvimento. Use as classes de estilo demonstradas aqui para
              manter a consistência visual do projeto.
            </p>
          </div>
        </header>

        <nav className="mb-8">
          <ul className="flex flex-wrap gap-4">
            <li>
              <a
                href="#typography"
                className="capx-text-sm px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Tipografia
              </a>
            </li>
            <li>
              <a
                href="#colors"
                className="capx-text-sm px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cores
              </a>
            </li>
            <li>
              <a
                href="#components"
                className="capx-text-sm px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Componentes
              </a>
            </li>
          </ul>
        </nav>

        <section id="typography" className="mb-16">
          <h2 className="capx-text-2xl font-bold mb-6 pb-2 border-b">
            Tipografia
          </h2>
          <FontSizeGuide />
        </section>

        <section id="colors" className="mb-16">
          <h2 className="capx-text-2xl font-bold mb-6 pb-2 border-b">Cores</h2>
          <p className="capx-text-base mb-4">
            As cores definidas no sistema de design CAPX são essenciais para
            manter a identidade visual da plataforma. Use as classes de cor do
            Tailwind personalizadas para aplicar cores consistentes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cores principais */}
            <div className="p-4 border rounded-md">
              <h3 className="font-bold mb-4">Cores Principais</h3>
              <div className="space-y-4">
                <div>
                  <div className="h-16 bg-capx-primary-red rounded-t-md"></div>
                  <div className="p-2 border-x border-b rounded-b-md">
                    <p className="font-bold">Primary Red</p>
                    <p className="capx-text-sm text-gray-600 dark:text-gray-400">
                      bg-capx-primary-red
                    </p>
                    <p className="capx-text-xs">#D43420</p>
                  </div>
                </div>
                <div>
                  <div className="h-16 bg-capx-primary-yellow rounded-t-md"></div>
                  <div className="p-2 border-x border-b rounded-b-md">
                    <p className="font-bold">Primary Yellow</p>
                    <p className="capx-text-sm text-gray-600 dark:text-gray-400">
                      bg-capx-primary-yellow
                    </p>
                    <p className="capx-text-xs">#f0c626</p>
                  </div>
                </div>
                <div>
                  <div className="h-16 bg-capx-primary-green rounded-t-md"></div>
                  <div className="p-2 border-x border-b rounded-b-md">
                    <p className="font-bold">Primary Green</p>
                    <p className="capx-text-sm text-gray-600 dark:text-gray-400">
                      bg-capx-primary-green
                    </p>
                    <p className="capx-text-xs">#02AE8C</p>
                  </div>
                </div>
                <div>
                  <div className="h-16 bg-capx-primary-blue rounded-t-md"></div>
                  <div className="p-2 border-x border-b rounded-b-md">
                    <p className="font-bold">Primary Blue</p>
                    <p className="capx-text-sm text-gray-600 dark:text-gray-400">
                      bg-capx-primary-blue
                    </p>
                    <p className="capx-text-xs">#0070b9</p>
                  </div>
                </div>
                <div>
                  <div className="h-16 bg-capx-primary-orange rounded-t-md"></div>
                  <div className="p-2 border-x border-b rounded-b-md">
                    <p className="font-bold">Primary Orange</p>
                    <p className="capx-text-sm text-gray-600 dark:text-gray-400">
                      bg-capx-primary-orange
                    </p>
                    <p className="capx-text-xs">#D43831</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cores secundárias */}
            <div className="p-4 border rounded-md">
              <h3 className="font-bold mb-4">Cores Secundárias</h3>
              <div className="space-y-4">
                <div>
                  <div className="h-16 bg-capx-secondary-purple rounded-t-md"></div>
                  <div className="p-2 border-x border-b rounded-b-md">
                    <p className="font-bold">Secondary Purple</p>
                    <p className="capx-text-sm text-gray-600 dark:text-gray-400">
                      bg-capx-secondary-purple
                    </p>
                    <p className="capx-text-xs">#851d6a</p>
                  </div>
                </div>
                <div>
                  <div className="h-16 bg-capx-secondary-gray rounded-t-md"></div>
                  <div className="p-2 border-x border-b rounded-b-md">
                    <p className="font-bold">Secondary Gray</p>
                    <p className="capx-text-sm text-gray-600 dark:text-gray-400">
                      bg-capx-secondary-gray
                    </p>
                    <p className="capx-text-xs">#053749</p>
                  </div>
                </div>
                <div>
                  <div className="h-16 bg-capx-secondary-red rounded-t-md"></div>
                  <div className="p-2 border-x border-b rounded-b-md">
                    <p className="font-bold">Secondary Red</p>
                    <p className="capx-text-sm text-gray-600 dark:text-gray-400">
                      bg-capx-secondary-red
                    </p>
                    <p className="capx-text-xs">#B11F0B</p>
                  </div>
                </div>
                <div>
                  <div className="h-16 bg-capx-secondary-green rounded-t-md"></div>
                  <div className="p-2 border-x border-b rounded-b-md">
                    <p className="font-bold">Secondary Green</p>
                    <p className="capx-text-sm text-gray-600 dark:text-gray-400">
                      bg-capx-secondary-green
                    </p>
                    <p className="capx-text-xs">#05a300</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cores de tema */}
            <div className="p-4 border rounded-md">
              <h3 className="font-bold mb-4">Cores de Tema</h3>
              <div className="space-y-4">
                <div>
                  <div className="h-16 bg-capx-light-bg rounded-t-md border"></div>
                  <div className="p-2 border-x border-b rounded-b-md">
                    <p className="font-bold">Light Background</p>
                    <p className="capx-text-sm text-gray-600 dark:text-gray-400">
                      bg-capx-light-bg
                    </p>
                    <p className="capx-text-xs">#FFFFFF</p>
                  </div>
                </div>
                <div>
                  <div className="h-16 bg-capx-light-box-bg rounded-t-md"></div>
                  <div className="p-2 border-x border-b rounded-b-md">
                    <p className="font-bold">Light Box Background</p>
                    <p className="capx-text-sm text-gray-600 dark:text-gray-400">
                      bg-capx-light-box-bg
                    </p>
                    <p className="capx-text-xs">#EFEFEF</p>
                  </div>
                </div>
                <div>
                  <div className="h-16 bg-capx-dark-bg rounded-t-md"></div>
                  <div className="p-2 border-x border-b rounded-b-md">
                    <p className="font-bold">Dark Background</p>
                    <p className="capx-text-sm text-gray-600 dark:text-gray-400">
                      bg-capx-dark-bg
                    </p>
                    <p className="capx-text-xs">#04222F</p>
                  </div>
                </div>
                <div>
                  <div className="h-16 bg-capx-dark-box-bg rounded-t-md"></div>
                  <div className="p-2 border-x border-b rounded-b-md">
                    <p className="font-bold">Dark Box Background</p>
                    <p className="capx-text-sm text-gray-600 dark:text-gray-400">
                      bg-capx-dark-box-bg
                    </p>
                    <p className="capx-text-xs">#053749</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="components" className="mb-16">
          <h2 className="capx-text-2xl font-bold mb-6 pb-2 border-b">
            Componentes
          </h2>
          <p className="capx-text-base mb-8">
            Esta seção será expandida para incluir exemplos dos principais
            componentes utilizados no sistema.
          </p>

          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
            <p className="capx-text-sm">
              Em desenvolvimento. Esta seção mostrará exemplos e uso de botões,
              cards, formulários e outros componentes.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Capacity } from '../data/staticCapacities';
import { getCapacityColor } from '@/lib/utils/capacitiesUtils';

// Função para determinar a cor baseada no id da capacidade
const getColorForCapacity = (id: number | string): string => {
  const idStr = String(id);
  if (idStr === '10') return 'organizational';
  if (idStr === '36') return 'communication';
  if (idStr === '50') return 'learning';
  if (idStr === '56') return 'community';
  if (idStr === '65') return 'social';
  if (idStr === '74') return 'strategic';
  if (idStr === '106') return 'technology';
  return 'gray-200';
};

interface D3TreeVisualizationProps {
  data: Capacity[];
  width?: number;
  height?: number;
}

export default function D3TreeVisualization({
  data,
  width = 1200,
  height = 800,
}: D3TreeVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Função para transformar dados flat em hierárquicos com controle de expansão
  const createHierarchy = (capacities: Capacity[]) => {
    // Função recursiva para processar capacidades com controle de expansão
    const processCapacity = (capacity: Capacity, level: number): any => {
      const isExpanded = expandedNodes.has(capacity.id);

      return {
        ...capacity,
        level: level,
        children: isExpanded
          ? (capacity.children || []).map(child => processCapacity(child, level + 1))
          : [],
      };
    };

    return capacities.map(rootCap => processCapacity(rootCap, 1));
  };

  // Função para expandir/colapsar uma capacidade
  const toggleNode = (nodeId: string, isRoot: boolean = false) => {
    const newExpandedNodes = new Set(expandedNodes);

    if (newExpandedNodes.has(nodeId)) {
      // Se já está expandido, colapsar
      newExpandedNodes.delete(nodeId);
    } else {
      // Se vai expandir
      if (isRoot) {
        // Se é uma capacidade raiz, colapsar todas as outras raízes primeiro
        data.forEach(capacity => {
          if (capacity.id !== nodeId) {
            newExpandedNodes.delete(capacity.id);
          }
        });
      }
      newExpandedNodes.add(nodeId);
    }

    setExpandedNodes(newExpandedNodes);
  };

  useEffect(() => {
    // Atualizar a variável CSS do fundo do SVG baseada no dark mode
    const updateSvgBackground = () => {
      const isDarkMode =
        document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.style.setProperty('--svg-bg', isDarkMode ? '#1f2937' : '#fafafa');
    };

    // Atualizar inicialmente
    updateSvgBackground();

    // Observar mudanças no dark mode
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          updateSvgBackground();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Observar mudanças no tema do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      updateSvgBackground();
    };
    mediaQuery.addEventListener('change', handleThemeChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640; // Mudado de 768 para 640
    const margin = {
      top: isMobile ? 0 : 20, // Reduzido de 2 para 0 para eliminar margem superior
      right: 120,
      bottom: isMobile ? 0 : 20, // Reduzido de 2 para 0 para eliminar margem inferior
      left: 50, // Reduzido de 120 para 50 para acomodar raízes próximas a (0,0)
    };
    const innerWidth = isMobile ? 1200 : width - margin.left - margin.right; // Forçar largura fixa no mobile
    const innerHeight = height - margin.top - margin.bottom;

    // Organizar capacidades raiz verticalmente em uma coluna
    const rootPositions: { x: number; y: number }[] = [];

    data.forEach((capacity, index) => {
      rootPositions.push({
        x: 50, // Posicionar próximas a (0,0) - reduzido de 100 para 50
        y: 10 + index * 80, // Primeira capacidade a 10px do topo, depois 80px entre cada uma
      });
    });

    // Ajustar largura do SVG para layout vertical das raízes
    const adjustedWidth = Math.max(width, 400); // Largura fixa para uma coluna

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const container = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Criar hierarquia
    const hierarchyData = createHierarchy(data);
    const roots = hierarchyData.map(item => d3.hierarchy(item));

    // Debug: contar total de nós
    const totalNodes = roots.reduce((acc, root) => acc + root.descendants().length, 0);
    console.log(`Total de capacidades renderizadas: ${totalNodes}`);
    console.log(`Capacidades raiz: ${roots.length}`);

    const allNodes: any[] = [];
    const allLinks: any[] = [];

    roots.forEach((root, index) => {
      // Posicionar cada raiz usando as posições calculadas
      const rootX = rootPositions[index].x;
      const rootY = rootPositions[index].y;

      // Processar nós da hierarquia (Layout Horizontal)
      const processNodes = (
        node: any,
        parentX: number,
        parentY: number,
        level: number,
        rootColor?: string
      ) => {
        const nodes: any[] = [];
        const links: any[] = [];

        // Determinar a cor da capacidade raiz
        const currentRootColor = level === 0 ? getColorForCapacity(node.data.id) : rootColor;

        // Adicionar o nó atual
        const currentNode = {
          ...node,
          x: parentX,
          y: parentY,
          depth: level,
          rootColor: currentRootColor,
        };
        nodes.push(currentNode);

        // Processar filhos se expandido
        if (expandedNodes.has(node.data.id) && node.children && node.children.length > 0) {
          // Calcular espaçamento baseado no tamanho dos nomes dos filhos
          const childNames = node.children.map((c: any) => c.data.name);
          const minChildSpacing = 120; // Reduzido espaçamento mínimo entre filhos
          const spacingPerChildChar = 6; // Reduzido espaçamento adicional por caractere

          // Calcular posições Y dos filhos baseadas no tamanho dos nomes
          let currentChildY = parentY;
          const childPositions: number[] = [];

          node.children.forEach((child: any) => {
            const nameLength = child.data.name.length;
            const spacing = minChildSpacing + nameLength * spacingPerChildChar;

            childPositions.push(currentChildY);
            currentChildY += spacing;
          });

          // Centralizar o grupo de filhos em relação ao pai
          const totalChildHeight = currentChildY - parentY - minChildSpacing;
          const offsetY = -totalChildHeight / 2;

          node.children.forEach((child: any, childIndex: number) => {
            const childY = childPositions[childIndex] + offsetY;
            const childX = parentX + (isMobile ? 500 : 400); // Aumentado de 350 para 500 no mobile

            const childNode = {
              ...child,
              x: childX,
              y: childY,
              depth: level + 1,
              rootColor: currentRootColor,
            };
            nodes.push(childNode);

            // Adicionar link
            links.push({
              source: { x: parentX, y: parentY },
              target: { x: childX, y: childY },
            });

            // Processar netos se expandido
            if (expandedNodes.has(child.data.id) && child.children && child.children.length > 0) {
              // Calcular espaçamento baseado no tamanho dos nomes dos netos
              const grandChildNames = child.children.map((gc: any) => gc.data.name);
              const minGrandChildSpacing = 100; // Reduzido espaçamento mínimo entre netos
              const spacingPerGrandChildChar = 5; // Reduzido espaçamento adicional por caractere

              // Calcular posições Y dos netos baseadas no tamanho dos nomes
              let currentGrandChildY = childY;
              const grandChildPositions: number[] = [];

              child.children.forEach((grandChild: any) => {
                const nameLength = grandChild.data.name.length;
                const spacing = minGrandChildSpacing + nameLength * spacingPerGrandChildChar;

                grandChildPositions.push(currentGrandChildY);
                currentGrandChildY += spacing;
              });

              // Centralizar o grupo de netos em relação ao pai
              const totalGrandChildHeight = currentGrandChildY - childY - minGrandChildSpacing;
              const offsetY = -totalGrandChildHeight / 2;

              child.children.forEach((grandChild: any, grandChildIndex: number) => {
                const grandChildY = grandChildPositions[grandChildIndex] + offsetY;
                const grandChildX = childX + (isMobile ? 600 : 350); // Aumentado de 400 para 600 no mobile

                const grandChildNode = {
                  ...grandChild,
                  x: grandChildX,
                  y: grandChildY,
                  depth: level + 2,
                  rootColor: currentRootColor,
                };
                nodes.push(grandChildNode);

                // Adicionar link
                links.push({
                  source: { x: childX, y: childY },
                  target: { x: grandChildX, y: grandChildY },
                });
              });
            }
          });
        }

        return { nodes, links };
      };

      const { nodes, links } = processNodes(root, rootX, rootY, 0, undefined);
      allNodes.push(...nodes);
      allLinks.push(...links);
    });

    // Adicionar links (conexões)
    const link = container
      .selectAll('.link')
      .data(allLinks)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d: any) => {
        return `M ${d.source.x} ${d.source.y}
                L ${d.target.x} ${d.target.y}`;
      })
      .style('fill', 'none')
      .style('stroke', (d: any) => {
        // Verificar se está em dark mode de forma mais robusta
        const isDarkMode =
          typeof window !== 'undefined' &&
          (document.documentElement.classList.contains('dark') ||
            window.matchMedia('(prefers-color-scheme: dark)').matches);
        return isDarkMode ? '#6b7280' : '#d1d5db'; // Cinza mais claro no dark mode, mais escuro no light mode
      })
      .style('stroke-width', '2px');

    // Adicionar nós
    const node = container
      .selectAll('.node')
      .data(allNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event: any, d: any) => {
        // Mostrar detalhes da capacidade
        setSelectedNode(d.data);

        // Expandir/colapsar para capacidades raiz e filhas
        if (d.depth === 0) {
          toggleNode(d.data.id, true); // isRoot = true para capacidades raiz
        } else if (d.depth === 1) {
          toggleNode(d.data.id, false); // isRoot = false para capacidades filhas
        }
      })
      .on('mouseover', function (event: any, d: any) {
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', (d: any) => {
            const level = d.depth;
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

            if (level === 0) return isMobile ? 18 : 12; // Raízes maiores no mobile
            if (level === 1) return isMobile ? 15 : 10; // Filhos médios no mobile
            return isMobile ? 12 : 8; // Netos menores no mobile
          });
      })
      .on('mouseout', function (event: any, d: any) {
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', (d: any) => {
            const level = d.depth;
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

            if (level === 0) return isMobile ? 15 : 10; // Raízes maiores no mobile
            if (level === 1) return isMobile ? 12 : 8; // Filhos médios no mobile
            return isMobile ? 10 : 6; // Netos menores no mobile
          });
      });

    // Adicionar círculos para os nós
    node
      .append('circle')
      .attr('r', (d: any) => {
        const level = d.depth;
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

        if (level === 0) return isMobile ? 15 : 10; // Raízes maiores no mobile
        if (level === 1) return isMobile ? 12 : 8; // Filhos médios no mobile
        return isMobile ? 10 : 6; // Netos menores no mobile
      })
      .style('fill', (d: any) => {
        const nodeData = d.data;
        if (nodeData.id === '0') return '#6b7280'; // Root

        const level = d.depth;

        // Usar a cor da raiz para todos os níveis
        if (d.rootColor) {
          return getCapacityColor(d.rootColor);
        }

        // Fallback para capacidades de primeiro nível
        if (level === 0) {
          const colorName = getColorForCapacity(nodeData.id);
          return getCapacityColor(colorName);
        }

        // Para capacidades de níveis mais profundos, usar cor mais escura
        if (level >= 2) return '#1f2937';
        if (level === 1) return '#374151';

        return '#6b7280'; // Fallback
      })
      .style('stroke', '#ffffff')
      .style('stroke-width', '2px');

    // Adicionar texto aos nós (Layout Horizontal)
    node
      .append('text')
      .attr('dy', '.35em')
      .attr('x', (d: any) => {
        // Posicionamento baseado no nível para layout horizontal
        const level = d.depth;
        const hasChildren = d.data.children && d.data.children.length > 0;
        const isExpanded = expandedNodes.has(d.data.id);
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

        if (level === 0) {
          return 25; // Raízes sempre à direita - aumentado de 15 para 25 para dar espaço ao ícone
        } else if (level === 1) {
          // Filhos sempre à direita no mobile para evitar sobreposição
          return isMobile ? 25 : hasChildren && isExpanded ? -20 : 20; // Aumentado para 25 no mobile
        } else {
          // Netos sempre à direita no mobile para evitar sobreposição
          return isMobile ? 25 : -25; // Aumentado para 25 no mobile
        }
      })
      .style('text-anchor', (d: any) => {
        const level = d.depth;
        const hasChildren = d.data.children && d.data.children.length > 0;
        const isExpanded = expandedNodes.has(d.data.id);
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

        if (level === 0) {
          return 'start'; // Raízes sempre à direita
        } else if (level === 1) {
          // Filhos sempre à direita no mobile para evitar sobreposição
          return isMobile ? 'start' : hasChildren && isExpanded ? 'end' : 'start';
        } else {
          // Netos sempre à direita no mobile para evitar sobreposição
          return isMobile ? 'start' : 'end';
        }
      })
      .text((d: any) => d.data.name)
      .style('font-size', (d: any) => {
        // Todas as capacidades com o mesmo tamanho de fonte
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
        return isMobile ? '32px' : '20px'; // Reduzido de 32px para 24px no mobile
      })
      .style('fill', (d: any) => {
        // Verificar se está em dark mode de forma mais robusta
        const isDarkMode =
          typeof window !== 'undefined' &&
          (document.documentElement.classList.contains('dark') ||
            window.matchMedia('(prefers-color-scheme: dark)').matches);
        return isDarkMode ? '#e5e7eb' : '#374151'; // Cinza claro no dark mode, escuro no light mode
      })
      .style('font-weight', '600'); // Deixar mais negrito no mobile também

    // Adicionar ícones (se disponíveis)
    node
      .append('image')
      .attr('xlink:href', (d: any) => {
        if (d.data.icon && d.data.id !== '0') {
          return `/static/images/${d.data.icon}`;
        }
        return null;
      })
      .attr('x', -8) // Ajustado de -6 para -8 para ficar mais próximo do círculo
      .attr('y', -8) // Ajustado de -6 para -8 para ficar mais próximo do círculo
      .attr('width', 16) // Aumentado de 12 para 16 para melhor visibilidade
      .attr('height', 16) // Aumentado de 12 para 16 para melhor visibilidade
      .style('display', (d: any) => (d.data.icon && d.data.code !== 0 ? 'block' : 'none'));

    // Adicionar zoom e pan
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event: any) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Centralizar visualização
    const initialTransform = d3.zoomIdentity.translate(margin.left, margin.top).scale(1);

    svg.call(zoom.transform as any, initialTransform);
  }, [data, width, height, expandedNodes]);

  // Calcular largura ajustada para layout vertical das raízes
  const calculateAdjustedWidth = () => {
    if (!data || data.length === 0) return width;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    // Para layout vertical das raízes, precisamos de mais largura para filhos e netos
    // No mobile, não limitar pela largura da tela - permitir canvas maior
    const baseWidth = isMobile ? 200 : 100; // Reduzido para acomodar raízes próximas a (0,0)
    const childLevelWidth = isMobile ? 600 : 450; // Aumentado de 400 para 600 no mobile
    const grandChildLevelWidth = isMobile ? 700 : 400; // Aumentado de 500 para 700 no mobile

    let totalWidth = baseWidth;

    // Verificar se há filhos expandidos
    const hasExpandedChildren = data.some(
      capacity =>
        expandedNodes.has(capacity.id) && capacity.children && capacity.children.length > 0
    );

    if (hasExpandedChildren) {
      totalWidth += childLevelWidth;

      // Verificar se há netos expandidos
      const hasExpandedGrandChildren = data.some(
        capacity =>
          expandedNodes.has(capacity.id) &&
          capacity.children &&
          capacity.children.some(
            child => expandedNodes.has(child.id) && child.children && child.children.length > 0
          )
      );

      if (hasExpandedGrandChildren) {
        totalWidth += grandChildLevelWidth;
      }
    }

    // No mobile, sempre usar largura mínima maior para evitar sobreposição
    if (isMobile) {
      return Math.max(1200, totalWidth); // Largura mínima de 1200px no mobile
    }

    return Math.max(width, totalWidth);
  };

  // Calcular altura ajustada para layout vertical das raízes
  const calculateAdjustedHeight = () => {
    if (!data || data.length === 0) return height;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    // Altura baseada no número de raízes, com espaçamento adequado
    const minHeight = isMobile ? 100 : 800; // Reduzido de 200 para 100 no mobile para eliminar margem desnecessária
    const totalHeight = 10 + (data.length - 1) * 80 + 40; // 10px do topo + espaçamento entre capacidades + 40px do final
    return Math.max(minHeight, totalHeight);
  };

  const adjustedWidth = calculateAdjustedWidth();
  const adjustedHeight = calculateAdjustedHeight();

  return (
    <div className="w-full">
      {/* Título e descrição movidos para fora do container com altura limitada */}
      <div className="mb-4 w-full mt-20">
        <h2
          className="text-xl font-semibold text-gray-900 dark:text-white mb-2 break-words w-full"
          style={{ wordBreak: 'break-word' }}
        >
          Visualização Interativa das Capacidades
        </h2>
        <p
          className="text-sm text-gray-600 dark:text-gray-400 mb-4 break-words w-full"
          style={{ wordBreak: 'break-word' }}
        >
          Clique nas capacidades raiz para expandir/colapsar • Clique nos círculos para ver detalhes
          • Use o mouse para fazer zoom e arrastar
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Visualização D3 */}
        <div className="flex-1">
          <div
            className={`w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800${typeof window !== 'undefined' && window.innerWidth < 640 ? ' overflow-y-auto overflow-x-auto max-h-[32rem]' : ' overflow-x-auto'}`}
          >
            <svg
              ref={svgRef}
              width="100%"
              height={adjustedHeight}
              viewBox={`0 0 ${adjustedWidth} ${adjustedHeight}`}
              preserveAspectRatio="xMidYMid meet"
              style={{
                backgroundColor: 'var(--svg-bg, #fafafa)',
                maxWidth: '100%',
              }}
              className="dark:bg-gray-800"
            />
          </div>
        </div>

        {/* Painel de informações */}
        {selectedNode && (
          <div className="w-full lg:w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 lg:sticky lg:top-0 lg:h-fit">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Detalhes da Capacidade
            </h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Nome:</span>
                <p className="text-gray-900 dark:text-white mt-1">
                  {selectedNode.name.charAt(0).toUpperCase() + selectedNode.name.slice(1)}
                </p>
              </div>
              {selectedNode.id !== '0' && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Código:</span>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedNode.id}</p>
                </div>
              )}
              {selectedNode.skill_type && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Tipo:</span>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedNode.skill_type}</p>
                </div>
              )}
              {selectedNode.level && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Nível:</span>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedNode.level}</p>
                </div>
              )}
              {selectedNode.description && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Descrição:</span>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedNode.description}</p>
                </div>
              )}
              {selectedNode.wd_code && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Código Wikidata:
                  </span>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedNode.wd_code}</p>
                </div>
              )}
              {selectedNode.parentCapacity && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Capacidade Pai:
                  </span>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {selectedNode.parentCapacity.name}
                  </p>
                </div>
              )}
              {selectedNode.children && selectedNode.children.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Filhos:</span>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {selectedNode.children.length} capacidades
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

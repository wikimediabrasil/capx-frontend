'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Capacity } from '../data/staticCapacities';
import { getCapacityColor } from '@/lib/utils/capacitiesUtils';
import { useTheme } from '@/contexts/ThemeContext';

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
  const zoomRef = useRef<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedNodeCoords, setSelectedNodeCoords] = useState<{ x: number; y: number } | null>(
    null
  );
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [focusedRootId, setFocusedRootId] = useState<string | null>(null);
  const { darkMode } = useTheme();
  


  // Definir margens horizontais para uso global
  const margin = {
    left: 50,
    right: 120,
  };

  // Definir tamanho da fonte e padding vertical de acordo com o dispositivo
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const nodeFontSize = isMobile ? 56 : 22; // px (mobile bem maior)
  const verticalPadding = isMobile ? 0 : 32; // padding vertical só no desktop
  const svgHeight = 432; // Reduzido de 512 para 432 para eliminar área vazia
  const rootCount = data.length;
  const availableHeight = svgHeight - 2 * verticalPadding;
  const rootPositions: { x: number; y: number }[] = [];
  for (let i = 0; i < rootCount; i++) {
    if (isMobile) {
      // Espaçamento extra no mobile
      const gapFactor = 1.3;
      const y =
        (svgHeight - nodeFontSize) * (rootCount === 1 ? 0.5 : i / (rootCount - 1)) * gapFactor;
      rootPositions.push({ x: 50, y });
    } else {
      // Desktop: padding vertical padrão
      const y =
        verticalPadding +
        (availableHeight - nodeFontSize) * (rootCount === 1 ? 0.5 : i / (rootCount - 1));
      rootPositions.push({ x: 50, y });
    }
  }

  // Função para centralizar o nó selecionado
  const centerOnNode = (nodeX: number, nodeY: number) => {
    console.log('centerOnNode chamada com coordenadas:', nodeX, nodeY);

    if (!svgRef.current || !zoomRef.current) {
      console.log('svgRef ou zoomRef não disponível');
      return;
    }

    const svg = d3.select(svgRef.current);
    const container = svg.select('g');

    if (container.empty()) {
      console.log('Container não encontrado');
      return;
    }

    // Obter as dimensões do container SVG
    const svgRect = svgRef.current.getBoundingClientRect();

    // Calcular o centro do viewport
    const viewportCenterX = svgRect.width / 2;
    const viewportCenterY = svgRect.height / 2;

    // Calcular a transformação necessária para centralizar o nó
    const currentTransform = d3.zoomTransform(svgRef.current);

    // Ajustar as coordenadas considerando as margens
    const adjustedNodeX = nodeX + margin.left;
    const adjustedNodeY = nodeY; // não usar margin.top

    const targetX = viewportCenterX - adjustedNodeX * currentTransform.k;
    const targetY = viewportCenterY - adjustedNodeY * currentTransform.k;

    console.log('Transformação calculada:', {
      viewportCenterX,
      viewportCenterY,
      adjustedNodeX,
      adjustedNodeY,
      targetX,
      targetY,
      currentScale: currentTransform.k,
    });

    // Aplicar a transformação com animação suave
    const newTransform = d3.zoomIdentity.translate(targetX, targetY).scale(currentTransform.k);

    console.log('Aplicando transformação:', newTransform);

    svg
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .call(zoomRef.current.transform, newTransform);

    // Adicionar efeito visual de destaque no nó centralizado
    const nodeElement = container
      .selectAll('.node')
      .filter((d: any) => d.x === nodeX && d.y === nodeY);
    if (!nodeElement.empty()) {
      // Adicionar classe de destaque temporária
      nodeElement
        .select('circle')
        .transition()
        .duration(200)
        .style('stroke', '#fbbf24')
        .style('stroke-width', '4px')
        .transition()
        .delay(1000)
        .duration(200)
        .style('stroke', '#ffffff')
        .style('stroke-width', '2px');
    }
  };

  // Função para mostrar todas as capacidades
  const showAllCapacities = () => {
    if (!svgRef.current || !zoomRef.current) return;

    const svg = d3.select(svgRef.current);
    const margin = {
      top: typeof window !== 'undefined' && window.innerWidth < 640 ? 0 : 20,
      left: 50,
    };

    const initialTransform = d3.zoomIdentity.translate(margin.left, margin.top).scale(1);

    svg
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .call(zoomRef.current.transform, initialTransform);

    // Resetar estado: limpar foco, seleção e expansões para mostrar todas as capacidades
    setFocusedRootId(null);
    setSelectedNode(null);
    setSelectedNodeCoords(null);
    setExpandedNodes(new Set());
  };

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
      if (isRoot) {
        setFocusedRootId(null); // Remover foco se colapsar
      }
    } else {
      // Se vai expandir
      if (isRoot) {
        // Se é uma capacidade raiz, colapsar todas as outras raízes primeiro
        data.forEach(capacity => {
          if (capacity.id !== nodeId) {
            newExpandedNodes.delete(capacity.id);
          }
        });
        setFocusedRootId(nodeId); // Definir foco na capacidade raiz expandida
      }
      newExpandedNodes.add(nodeId);
    }

    setExpandedNodes(newExpandedNodes);
  };

  // Função utilitária para capitalizar a primeira letra
  function capitalizeFirst(str: string) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Remover useEffect desnecessário - o dark mode já é detectado pelo useTheme

  // Forçar re-renderização do SVG quando o dark mode mudar
  useEffect(() => {
    // Forçar re-renderização do SVG
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.style('backgroundColor', darkMode ? '#053749' : '#fafafa');
      svg.style('color', darkMode ? '#f3f4f6' : '#222');
    }
  }, [darkMode]);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640; // Mudado de 768 para 640
    // Definir margens pequenas para o topo
    const margin = {
      top: 8, // valor pequeno para o topo
      right: 120,
      bottom: isMobile ? 0 : 20,
      left: 50,
    };
    const innerWidth = isMobile ? 1200 : width - margin.left - margin.right; // Forçar largura fixa no mobile
    const innerHeight = height - margin.top - margin.bottom;

    // Ajustar largura do SVG para layout vertical das raízes
    const adjustedWidth = Math.max(width, 400); // Largura fixa para uma coluna

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    // Voltar o grupo principal do SVG para translate(margin.left, 0)
    const container = svg.append('g').attr('transform', `translate(${margin.left},0)`);

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
            // Aumentar o deslocamento horizontal no mobile
            const childX = parentX + (isMobile ? 700 : 400); // era 500, agora 700 no mobile

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
      .style('stroke', (d: any) => darkMode ? '#6b7280' : '#d1d5db') // cor do link conforme tema
      .style('stroke-width', '2px')
      .style('opacity', (d: any) => {
        // Aplicar fade-out para links de capacidades raiz não focadas
        if (focusedRootId) {
          // Determinar se o link pertence à capacidade raiz focada
          const sourceNode = allNodes.find(
            (node: any) => node.x === d.source.x && node.y === d.source.y
          );
          const targetNode = allNodes.find(
            (node: any) => node.x === d.target.x && node.y === d.target.y
          );

          if (sourceNode && targetNode) {
            const sourceRootColor = sourceNode.rootColor;
            const targetRootColor = targetNode.rootColor;
            const focusedRootColor = getColorForCapacity(focusedRootId);

            // Se ambos os nós pertencem à mesma árvore da capacidade focada
            if (sourceRootColor === focusedRootColor && targetRootColor === focusedRootColor) {
              return 1;
            }
            return 0.2; // Fade-out para links não relacionados
          }
        }
        return 1; // Mostrar todos os links normalmente
      });

    // Adicionar nós
    const node = container
      .selectAll('.node')
      .data(allNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('data-node-id', (d: any) => d.data.id)
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event: any, d: any) => {
        // Mostrar detalhes da capacidade
        setSelectedNode(d.data);
        setSelectedNodeCoords({ x: d.x, y: d.y });

        // Centralizar na capacidade clicada
        console.log('Centralizando no nó:', d.data.name, 'coordenadas:', d.x, d.y);
        centerOnNode(d.x, d.y);

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
        if (level >= 2) return '#053749';
        if (level === 1) return '#0a4a5f';

        return '#6b7280'; // Fallback
      })
      .style('stroke', (d: any) => {
        // Destacar o nó selecionado
        if (selectedNode && selectedNode.id === d.data.id) {
          return '#fbbf24'; // Amarelo para nó selecionado
        }
        return '#ffffff';
      })
      .style('stroke-width', (d: any) => {
        // Destacar o nó selecionado com borda mais grossa
        if (selectedNode && selectedNode.id === d.data.id) {
          return '4px';
        }
        return '2px';
      })
      .style('opacity', (d: any) => {
        // Aplicar fade-out para capacidades raiz não focadas
        if (focusedRootId && d.depth === 0) {
          // Se há uma capacidade raiz focada, mostrar apenas ela e seus descendentes
          return d.data.id === focusedRootId || d.rootColor === getColorForCapacity(focusedRootId)
            ? 1
            : 0.2;
        }
        return 1; // Mostrar todas as capacidades normalmente
      });

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
      .text((d: any) => capitalizeFirst(d.data.name))
      .style('font-size', (d: any) => {
        // Destacar capacidades raiz com fonte maior
        if (d.depth === 0) return `${nodeFontSize}px`;
        return isMobile ? '24px' : '18px';
      })
      .style('fill', (d: any) => darkMode ? '#f3f4f6' : '#222') // cor do texto conforme tema
      .style('font-weight', '600') // Deixar mais negrito no mobile também
      .style('opacity', (d: any) => {
        // Aplicar fade-out para capacidades raiz não focadas
        if (focusedRootId && d.depth === 0) {
          // Se há uma capacidade raiz focada, mostrar apenas ela e seus descendentes
          return d.data.id === focusedRootId || d.rootColor === getColorForCapacity(focusedRootId)
            ? 1
            : 0.2;
        }
        return 1; // Mostrar todas as capacidades normalmente
      });

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
    zoomRef.current = zoom; // Atribuir o zoom ao ref

    // Centralizar visualização
    const initialTransform = d3.zoomIdentity.translate(margin.left, margin.top).scale(1);

    svg.call(zoom.transform as any, initialTransform);

    // Remover renderização de detalhes dentro do SVG

    // Adicionar evento de clique no SVG para limpar seleção
    svg.on('click', (event: any) => {
      // Só limpar se clicou no SVG, não em um nó
      if (event.target === svgRef.current) {
        setSelectedNode(null);
        setSelectedNodeCoords(null);
      }
    });
  }, [data, width, height, expandedNodes, selectedNode, focusedRootId, darkMode]);

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
    const totalHeight = 10 + (data.length - 1) * 80 + 40; // 10px do topo + espaçamento entre capacidades + 40px do final

    // No mobile, limitar a altura máxima para evitar scroll vertical
    if (isMobile) {
      const maxMobileHeight = 512; // 32rem = 512px
      return Math.min(totalHeight, maxMobileHeight);
    }

    // No desktop, usar altura mínima de 800px
    const minDesktopHeight = 800;
    return Math.max(minDesktopHeight, totalHeight);
  };

  const adjustedWidth = calculateAdjustedWidth();
  const adjustedHeight = calculateAdjustedHeight();

  return (
    <div className="w-full">
      {/* CSS para esconder scrollbars */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Título e descrição movidos para fora do container com altura limitada */}
      <div className="mb-4 w-full mt-20">
        <h2
          className={`text-xl font-semibold text-gray-900 dark:text-white mb-2 break-words w-full ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
          style={{ wordBreak: 'break-word' }}
        >
          Visualização Interativa das Capacidades
        </h2>
        <p
          className="text-sm text-gray-600 dark:text-gray-400 mb-4 break-words w-full"
          style={{ wordBreak: 'break-word' }}
        >
          Clique nas capacidades raiz para expandir/colapsar e focar • Clique nos círculos para ver
          detalhes e centralizar automaticamente • Use o mouse para fazer zoom e arrastar • Mostrar
          todas para resetar o foco
        </p>

        {/* Botões de controle */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={showAllCapacities}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Mostrar Todas as Capacidades
          </button>
        </div>
      </div>

            <div className="flex flex-col lg:flex-row gap-6">
        {/* Visualização D3 */}
        <div className="flex-1 relative">
          <div
            className={`w-full border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 hide-scrollbar${isMobile ? ' overflow-x-auto' : ' overflow-x-auto'}`}
            style={{
              overflowY: 'hidden',
              height: svgHeight,
              maxHeight: svgHeight,
              position: 'relative',
            }}
          >
            <svg
              key={`svg-${darkMode}`}
              ref={svgRef}
              width="100%"
              height={svgHeight}
              viewBox={`0 0 ${adjustedWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
              style={{
                backgroundColor: darkMode ? '#053749' : '#fafafa',
                color: darkMode ? '#f3f4f6' : '#222',
                maxWidth: '100%',
                display: 'block',
              }}
            />
          </div>
        </div>
        
        {/* Detalhes da capacidade */}
        {selectedNode && (
          <div className="lg:w-80 flex-shrink-0">
            <div 
              className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 h-full"
              style={{
                backgroundColor: darkMode ? '#1f2937' : '#fafafa',
                color: darkMode ? '#f3f4f6' : '#222',
              }}
            >
              <h3 
                className="text-xl font-semibold mb-4"
                style={{ color: darkMode ? '#f3f4f6' : '#222' }}
              >
                {capitalizeFirst(selectedNode.name)}
              </h3>
              {selectedNode.description && (
                <p 
                  className="leading-relaxed"
                  style={{ color: darkMode ? '#d1d5db' : '#374151' }}
                >
                  {selectedNode.description}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      

    </div>
  );
}

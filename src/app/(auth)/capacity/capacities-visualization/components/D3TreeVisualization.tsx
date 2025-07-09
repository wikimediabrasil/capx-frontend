"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Capacity } from "@/types/capacity";
import { getCapacityColor } from "@/lib/utils/capacitiesUtils";

interface D3TreeVisualizationProps {
  data: Capacity[];
  width?: number;
  height?: number;
}

export default function D3TreeVisualization({ 
  data, 
  width = 1000, 
  height = 1000 
}: D3TreeVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Função para transformar dados flat em hierárquicos
  const createHierarchy = (capacities: Capacity[]) => {
    const root = {
      name: "Capacidades",
      code: 0,
      color: "#6b7280",
      level: 0,
      children: capacities.map(rootCap => ({
        ...rootCap,
        level: 1,
        children: (rootCap.children || []).map(child => ({
          ...child,
          level: 2,
          children: (child.children || []).map(grandchild => ({
            ...grandchild,
            level: 3
          }))
        }))
      }))
    };
    return root;
  };

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 150, bottom: 40, left: 150 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const container = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Criar hierarquia
    const hierarchyData = createHierarchy(data);
    const root = d3.hierarchy(hierarchyData);

    // Configurar layout da árvore com mais espaçamento vertical
    const treeLayout = d3.tree()
      .size([innerHeight, innerWidth])
      .separation((a: any, b: any) => {
        // Aumentar separação entre nós do mesmo nível
        if (a.depth === b.depth) {
          // Mais espaço para capacidades netas (nível 3)
          if (a.depth === 3) return 2.5;
          if (a.depth === 2) return 2;
          return 1.5;
        }
        return 1;
      });
    
    const treeData = treeLayout(root);

    // Normalizar para layouts de profundidade fixos
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);

    // Definir posições baseadas na profundidade com mais espaçamento
    nodes.forEach((d: any) => {
      d.y = d.depth * 180; // Reduzido de 200 para 180
    });

    // Adicionar links (conexões)
    const link = container.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", (d: any) => {
        return `M ${d.y} ${d.x}
                C ${(d.y + d.parent.y) / 2} ${d.x},
                  ${(d.y + d.parent.y) / 2} ${d.parent.x},
                  ${d.parent.y} ${d.parent.x}`;
      })
      .style("fill", "none")
      .style("stroke", "#ccc")
      .style("stroke-width", "2px");

    // Adicionar nós
    const node = container.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
      .style("cursor", "pointer")
      .on("click", (event: any, d: any) => {
        setSelectedNode(d.data);
      })
      .on("mouseover", function(event: any, d: any) {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", 12);
      })
      .on("mouseout", function(event: any, d: any) {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", 8);
      });

    // Adicionar círculos para os nós
    node.append("circle")
      .attr("r", 8)
      .style("fill", (d: any) => {
        const nodeData = d.data;
        if (nodeData.code === 0) return "#6b7280"; // Root
        
        const level = nodeData.level || d.depth;
        if (level === 1) return getCapacityColor(nodeData.color);
        if (level === 2) return getCapacityColor(nodeData.color);
        if (level === 3) return "#507380";
        return "#e5e7eb";
      })
      .style("stroke", "#ffffff")
      .style("stroke-width", "2px");

    // Adicionar texto aos nós
    node.append("text")
      .attr("dy", ".35em")
      .attr("x", (d: any) => d.children ? -13 : 13)
      .style("text-anchor", (d: any) => d.children ? "end" : "start")
      .text((d: any) => d.data.name)
      .style("font-size", "12px")
      .style("fill", "#374151")
      .style("font-weight", "500");

    // Adicionar ícones (se disponíveis)
    node.append("image")
      .attr("xlink:href", (d: any) => {
        if (d.data.icon && d.data.code !== 0) {
          return `/static/images/${d.data.icon}`;
        }
        return null;
      })
      .attr("x", -6)
      .attr("y", -6)
      .attr("width", 12)
      .attr("height", 12)
      .style("display", (d: any) => d.data.icon && d.data.code !== 0 ? "block" : "none");

    // Adicionar código do nó
    node.append("text")
      .attr("dy", "1.5em")
      .attr("x", (d: any) => d.children ? -13 : 13)
      .style("text-anchor", (d: any) => d.children ? "end" : "start")
      .text((d: any) => d.data.code !== 0 ? `#${d.data.code}` : "")
      .style("font-size", "10px")
      .style("fill", "#6b7280")
      .style("font-weight", "400");

    // Adicionar zoom e pan
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event: any) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    // Centralizar visualização
    const initialTransform = d3.zoomIdentity
      .translate(margin.left, margin.top)
      .scale(1);
    
    svg.call(zoom.transform as any, initialTransform);

  }, [data, width, height]);

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Visualização D3 */}
        <div className="flex-1">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Visualização Interativa das Capacidades
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Clique nos nós para ver detalhes • Use o mouse para fazer zoom e arrastar • Passe o mouse sobre os nós para destacar
            </p>
          </div>
          <div className="w-full overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
            <svg
              ref={svgRef}
              width={width}
              height={height}
              style={{ 
                backgroundColor: "#fafafa",
                minWidth: "800px"
              }}
              className="dark:bg-gray-900"
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
                <p className="text-gray-900 dark:text-white mt-1">{selectedNode.name}</p>
              </div>
              {selectedNode.code !== 0 && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Código:</span>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedNode.code}</p>
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
                  <span className="font-medium text-gray-700 dark:text-gray-300">Código Wikidata:</span>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedNode.wd_code}</p>
                </div>
              )}
              {selectedNode.parentCapacity && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Capacidade Pai:</span>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedNode.parentCapacity.name}</p>
                </div>
              )}
              {selectedNode.children && selectedNode.children.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Filhos:</span>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedNode.children.length} capacidades</p>
                </div>
              )}
              {selectedNode.color && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Cor:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: selectedNode.code === 0 ? "#6b7280" : getCapacityColor(selectedNode.color) }}
                    />
                    <span className="text-gray-900 dark:text-white">{selectedNode.color}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
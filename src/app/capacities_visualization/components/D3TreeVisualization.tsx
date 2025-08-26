'use client';

import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getCapacityColor } from '@/lib/utils/capacitiesUtils';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

// Interface para as capacidades da visualização D3
interface D3Capacity {
  id: string;
  name: string;
  color: string;
  description: string;
  children: D3Capacity[];
}

// Function to determine color based on capacity id
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
  data: D3Capacity[];
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
  const { darkMode, setDarkMode } = useTheme();
  const { language, pageContent } = useApp();
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render when theme changes

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only update if no theme is saved in localStorage
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [setDarkMode]);

  // Define horizontal margins for global use
  const margin = {
    left: 50,
    right: 120,
  };

  // Define font size and vertical padding according to device
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const nodeFontSize = isMobile ? 56 : 22; // px (much larger on mobile)
  const verticalPadding = isMobile ? 0 : 32; // vertical padding only on desktop
  const svgHeight = 432; // Reduced from 512 to 432 to eliminate empty area
  const rootCount = data.length;
  const availableHeight = svgHeight - 2 * verticalPadding;
  const rootPositions: { x: number; y: number }[] = [];
  for (let i = 0; i < rootCount; i++) {
    if (isMobile) {
      // Extra spacing on mobile
      const gapFactor = 1.3;
      const y =
        (svgHeight - nodeFontSize) * (rootCount === 1 ? 0.5 : i / (rootCount - 1)) * gapFactor;
      rootPositions.push({ x: 50, y });
    } else {
      // Desktop: standard vertical padding
      const y =
        verticalPadding +
        (availableHeight - nodeFontSize) * (rootCount === 1 ? 0.5 : i / (rootCount - 1));
      rootPositions.push({ x: 50, y });
    }
  }

  // Function to center the selected node
  const centerOnNode = (nodeX: number, nodeY: number) => {
    if (!svgRef.current || !zoomRef.current) {
      console.error('svgRef or zoomRef not available');
      return;
    }

    const svg = d3.select(svgRef.current);
    const container = svg.select('g');

    // Get SVG container dimensions
    const svgRect = svgRef.current.getBoundingClientRect();

    // Calculate viewport center
    const viewportCenterX = svgRect.width / 2;
    const viewportCenterY = svgRect.height / 2;

    // Calculate transformation needed to center the node
    const currentTransform = d3.zoomTransform(svgRef.current);

    // Adjust coordinates considering margins
    const adjustedNodeX = nodeX + margin.left;
    const adjustedNodeY = nodeY; // don't use margin.top

    const targetX = viewportCenterX - adjustedNodeX * currentTransform.k;
    const targetY = viewportCenterY - adjustedNodeY * currentTransform.k;

    // Apply transformation with smooth animation
    const newTransform = d3.zoomIdentity.translate(targetX, targetY).scale(currentTransform.k);

    svg
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .call(zoomRef.current.transform, newTransform);

    // Add visual highlight effect on centered node
    const nodeElement = container
      .selectAll('.node')
      .filter((d: any) => d.x === nodeX && d.y === nodeY);
    if (!nodeElement.empty()) {
      // Add temporary highlight class
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

  // Function to show all capacities
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

    // Reset state: clear focus, selection and expansions to show all capacities
    setFocusedRootId(null);
    setSelectedNode(null);
    setSelectedNodeCoords(null);
    setExpandedNodes(new Set());
  };

  // Function to transform flat data into hierarchical with expansion control
  const createHierarchy = (capacities: D3Capacity[]) => {
    // Recursive function to process capacities with expansion control
    const processCapacity = (capacity: D3Capacity, level: number): any => {
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

  // Function to expand/collapse a capacity
  const toggleNode = (nodeId: string, isRoot: boolean = false) => {
    const newExpandedNodes = new Set(expandedNodes);

    if (newExpandedNodes.has(nodeId)) {
      // If already expanded, collapse
      newExpandedNodes.delete(nodeId);
      if (isRoot) {
        setFocusedRootId(null); // Remove focus if collapsing
      }
    } else {
      // If going to expand
      if (isRoot) {
        // If it's a root capacity, collapse all other roots first
        data.forEach(capacity => {
          if (capacity.id !== nodeId) {
            newExpandedNodes.delete(capacity.id);
          }
        });
        setFocusedRootId(nodeId); // Set focus on expanded root capacity
      }
      newExpandedNodes.add(nodeId);
    }

    setExpandedNodes(newExpandedNodes);
  };

  // Utility function to capitalize first letter
  function capitalizeFirst(str: string) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Force SVG re-render when dark mode changes
  useEffect(() => {
    // Force complete re-render by updating forceUpdate state
    setForceUpdate(prev => prev + 1);

    // Force complete SVG re-render by clearing and re-creating
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      const backgroundColor = darkMode ? '#053749' : '#fafafa';
      const textColor = darkMode ? '#f3f4f6' : '#222';

      // Clear all SVG content immediately
      svg.selectAll('*').remove();

      // Re-apply background and text colors
      svg.style('backgroundColor', backgroundColor);
      svg.style('color', textColor);

      // Force immediate re-render by triggering the main useEffect
      // This ensures the SVG is completely re-created with new theme colors
    }
  }, [darkMode]);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640; // Changed from 768 to 640
    // Define small margins for the top
    const margin = {
      top: 8, // small value for the top
      right: 120,
      bottom: isMobile ? 0 : 20,
      left: 50,
    };
    const innerWidth = isMobile ? 1200 : width - margin.left - margin.right; // Force fixed width on mobile
    const innerHeight = height - margin.top - margin.bottom;

    // Adjust SVG width for vertical root layout
    const adjustedWidth = Math.max(width, 400); // Fixed width for a column

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    // Return main SVG group to translate(margin.left, 0)
    const container = svg.append('g').attr('transform', `translate(${margin.left},0)`);

    // Create hierarchy
    const hierarchyData = createHierarchy(data);
    const roots = hierarchyData.map(item => d3.hierarchy(item));

    const allNodes: any[] = [];
    const allLinks: any[] = [];

    roots.forEach((root, index) => {
      // Position each root using calculated positions
      const rootX = rootPositions[index].x;
      const rootY = rootPositions[index].y;

      // Process hierarchy nodes (Horizontal Layout)
      const processNodes = (
        node: any,
        parentX: number,
        parentY: number,
        level: number,
        rootColor?: string
      ) => {
        const nodes: any[] = [];
        const links: any[] = [];

        // Determine root capacity color
        const currentRootColor = level === 0 ? getColorForCapacity(node.data.id) : rootColor;

        // Add current node
        const currentNode = {
          ...node,
          x: parentX,
          y: parentY,
          depth: level,
          rootColor: currentRootColor,
        };
        nodes.push(currentNode);

        // Process children if expanded
        if (expandedNodes.has(node.data.id) && node.children && node.children.length > 0) {
          // Calculate spacing based on child names length
          const childNames = node.children.map((c: any) => c.data.name);
          const minChildSpacing = 50; // Reduced minimum spacing between children
          const spacingPerChildChar = 2; // Reduced additional spacing per character

          // Calculate Y positions of children based on name length
          let currentChildY = parentY;
          const childPositions: number[] = [];

          node.children.forEach((child: any) => {
            const nameLength = child.data.name.length;
            const spacing = minChildSpacing + nameLength * spacingPerChildChar;

            childPositions.push(currentChildY);
            currentChildY += spacing;
          });

          // Center children group relative to parent
          const totalChildHeight = currentChildY - parentY - minChildSpacing;
          const offsetY = -totalChildHeight / 2;

          node.children.forEach((child: any, childIndex: number) => {
            const childY = childPositions[childIndex] + offsetY;
            // Increase horizontal offset on mobile
            const childX = parentX + (isMobile ? 700 : 400); // was 500, now 700 on mobile

            const childNode = {
              ...child,
              x: childX,
              y: childY,
              depth: level + 1,
              rootColor: currentRootColor,
            };
            nodes.push(childNode);

            // Add link
            links.push({
              source: { x: parentX, y: parentY },
              target: { x: childX, y: childY },
            });

            // Process grandchildren if expanded
            if (expandedNodes.has(child.data.id) && child.children && child.children.length > 0) {
              // Calculate spacing based on grandchild names length
              const grandChildNames = child.children.map((gc: any) => gc.data.name);
              const minGrandChildSpacing = 40; // Reduced minimum spacing between grandchildren
              const spacingPerGrandChildChar = 1; // Reduced additional spacing per character

              // Calculate Y positions of grandchildren based on name length
              let currentGrandChildY = childY;
              const grandChildPositions: number[] = [];

              child.children.forEach((grandChild: any) => {
                const nameLength = grandChild.data.name.length;
                const spacing = minGrandChildSpacing + nameLength * spacingPerGrandChildChar;

                grandChildPositions.push(currentGrandChildY);
                currentGrandChildY += spacing;
              });

              // Center children group relative to parent
              const totalChildHeight = currentGrandChildY - childY - minGrandChildSpacing;
              const offsetY = -totalChildHeight / 2;

              child.children.forEach((grandChild: any, grandChildIndex: number) => {
                const grandChildY = grandChildPositions[grandChildIndex] + offsetY;
                const grandChildX = childX + (isMobile ? 600 : 350); // Increased from 400 to 600 on mobile

                const grandChildNode = {
                  ...grandChild,
                  x: grandChildX,
                  y: grandChildY,
                  depth: level + 2,
                  rootColor: currentRootColor,
                };
                nodes.push(grandChildNode);

                // Add link
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

    // Add links (connections) - using smooth curves instead of straight lines
    const link = container
      .selectAll('.link')
      .data(allLinks)
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d: any) => {
        // Create smooth curve between nodes
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);

        // Calculate control point to create a smooth curve
        const controlX = d.source.x + dx * 0.5;
        const controlY = d.source.y + dy * 0.5 + dr * 0.1; // Small curvature

        return `M ${d.source.x} ${d.source.y} Q ${controlX} ${controlY} ${d.target.x} ${d.target.y}`;
      })
      .style('fill', 'none')
      .style('stroke', (d: any) => {
        const linkColor = darkMode ? '#9ca3af' : '#9ca3af'; // More visible in both themes
        return linkColor;
      })
      .style('stroke-width', '2px')
      .style('stroke-linecap', 'round') // Rounded ends
      .style('opacity', (d: any) => {
        // Apply fade-out for non-focused root capacity links
        if (focusedRootId) {
          // Determine if link belongs to focused root capacity
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

            // If both nodes belong to the same focused capacity tree
            if (sourceRootColor === focusedRootColor && targetRootColor === focusedRootColor) {
              return 1;
            }
            return 0.2; // Fade-out for unrelated links
          }
        }
        return 1; // Show all links normally
      });

    // Add nodes
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
        // Show capacity details
        setSelectedNode(d.data);
        setSelectedNodeCoords({ x: d.x, y: d.y });

        // Center on clicked capacity
        centerOnNode(d.x, d.y);

        // Expand/collapse for root and child capacities
        if (d.depth === 0) {
          toggleNode(d.data.id, true); // isRoot = true for root capacities
        } else if (d.depth === 1) {
          toggleNode(d.data.id, false); // isRoot = false for child capacities
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

            if (level === 0) return isMobile ? 18 : 12; // Larger roots on mobile
            if (level === 1) return isMobile ? 15 : 10; // Medium children on mobile
            return isMobile ? 12 : 8; // Smaller grandchildren on mobile
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

            if (level === 0) return isMobile ? 15 : 10; // Larger roots on mobile
            if (level === 1) return isMobile ? 12 : 8; // Medium children on mobile
            return isMobile ? 10 : 6; // Smaller grandchildren on mobile
          });
      });

    // Add shapes for nodes (hexagons for better visualization)
    node.each(function (d: any) {
      const level = d.depth;
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

      let radius;
      if (level === 0)
        radius = isMobile ? 15 : 10; // Larger roots
      else if (level === 1)
        radius = isMobile ? 12 : 8; // Medium children
      else radius = isMobile ? 10 : 6; // Smaller grandchildren

      // Determine fill color
      const nodeData = d.data;
      let fillColor;
      if (nodeData.id === '0') {
        fillColor = '#6b7280'; // Root
      } else if (d.rootColor) {
        fillColor = getCapacityColor(d.rootColor);
      } else if (level === 0) {
        const colorName = getColorForCapacity(nodeData.id);
        fillColor = getCapacityColor(colorName);
      } else if (level >= 2) {
        fillColor = '#053749';
      } else if (level === 1) {
        fillColor = '#0a4a5f';
      } else {
        fillColor = '#6b7280';
      }

      // Determine border color
      const strokeColor = selectedNode && selectedNode.id === d.data.id ? '#fbbf24' : '#ffffff';
      const strokeWidth = selectedNode && selectedNode.id === d.data.id ? '4px' : '2px';

      // Determine opacity
      let opacity = 1;
      if (focusedRootId && d.depth === 0) {
        opacity =
          d.data.id === focusedRootId || d.rootColor === getColorForCapacity(focusedRootId)
            ? 1
            : 0.2;
      }

      // Create hexagon
      const hexagon = d3.select(this).append('path');
      const points: string[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        points.push(`${x},${y}`);
      }

      hexagon
        .attr('d', `M ${points.join(' L ')} Z`)
        .style('fill', fillColor)
        .style('stroke', strokeColor)
        .style('stroke-width', strokeWidth)
        .style('opacity', opacity);
    });

    // Add text to nodes (Horizontal Layout)
    node
      .append('text')
      .attr('dy', '.35em')
      .attr('x', (d: any) => {
        // Positioning based on level for horizontal layout
        const level = d.depth;
        const hasChildren = d.data.children && d.data.children.length > 0;
        const isExpanded = expandedNodes.has(d.data.id);
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

        if (level === 0) {
          return 25; // Roots always to the right - increased from 15 to 25 to give space to icon
        } else if (level === 1) {
          // Children always to the right on mobile to avoid overlap
          return isMobile ? 25 : hasChildren && isExpanded ? -20 : 20; // Increased to 25 on mobile
        } else {
          // Grandchildren always to the right on mobile to avoid overlap
          return isMobile ? 25 : -25; // Increased to 25 on mobile
        }
      })
      .style('text-anchor', (d: any) => {
        const level = d.depth;
        const hasChildren = d.data.children && d.data.children.length > 0;
        const isExpanded = expandedNodes.has(d.data.id);
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

        if (level === 0) {
          return 'start'; // Roots always to the right
        } else if (level === 1) {
          // Children always to the right on mobile to avoid overlap
          return isMobile ? 'start' : hasChildren && isExpanded ? 'end' : 'start';
        } else {
          // Grandchildren always to the right on mobile to avoid overlap
          return isMobile ? 'start' : 'end';
        }
      })
      .text((d: any) => capitalizeFirst(d.data.name))
      .style('font-size', (d: any) => {
        // Highlight root capacities with larger font
        if (d.depth === 0) return `${nodeFontSize}px`;
        return isMobile ? '24px' : '18px';
      })
      .style('fill', (d: any) => {
        const textColor = darkMode ? '#ffffff' : '#000000'; // More contrast
        return textColor;
      })
      .style('font-weight', '600') // Keep bold on mobile too
      .style('opacity', (d: any) => {
        // Apply fade-out for non-focused root capacities
        if (focusedRootId && d.depth === 0) {
          // If there's a focused root capacity, show only it and its descendants
          return d.data.id === focusedRootId || d.rootColor === getColorForCapacity(focusedRootId)
            ? 1
            : 0.2;
        }
        return 1; // Show all capacities normally
      });

    // Add icons (if available)
    node
      .append('image')
      .attr('xlink:href', (d: any) => {
        if (d.data.icon && d.data.id !== '0') {
          return `/static/images/${d.data.icon}`;
        }
        return null;
      })
      .attr('x', -8) // Adjusted from -6 to -8 to be closer to circle
      .attr('y', -8) // Adjusted from -6 to -8 to be closer to circle
      .attr('width', 16) // Increased from 12 to 16 for better visibility
      .attr('height', 16) // Increased from 12 to 16 for better visibility
      .style('display', (d: any) => (d.data.icon && d.data.code !== 0 ? 'block' : 'none'));

    // Add zoom and pan
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event: any) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom as any);
    zoomRef.current = zoom; // Assign zoom to ref

    // Center visualization
    const initialTransform = d3.zoomIdentity.translate(margin.left, margin.top).scale(1);

    svg.call(zoom.transform as any, initialTransform);

    // Remove details rendering inside SVG

    // Add click event on SVG to clear selection
    svg.on('click', (event: any) => {
      // Only clear if clicked on SVG, not on a node
      if (event.target === svgRef.current) {
        setSelectedNode(null);
        setSelectedNodeCoords(null);
      }
    });
  }, [data, width, height, expandedNodes, selectedNode, focusedRootId, darkMode, forceUpdate]);

  // Calculate adjusted width for vertical root layout
  const calculateAdjustedWidth = () => {
    if (!data || data.length === 0) return width;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    // For vertical root layout, we need more width for children and grandchildren
    // On mobile, don't limit by screen width - allow larger canvas
    const baseWidth = isMobile ? 200 : 100; // Reduced to accommodate roots near (0,0)
    const childLevelWidth = isMobile ? 600 : 450; // Increased from 400 to 600 on mobile
    const grandChildLevelWidth = isMobile ? 700 : 400; // Increased from 500 to 700 on mobile

    let totalWidth = baseWidth;

    // Check if there are expanded children
    const hasExpandedChildren = data.some(
      capacity =>
        expandedNodes.has(capacity.id) && capacity.children && capacity.children.length > 0
    );

    if (hasExpandedChildren) {
      totalWidth += childLevelWidth;

      // Check if there are expanded grandchildren
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

    // On mobile, always use larger minimum width to avoid overlap
    if (isMobile) {
      return Math.max(1200, totalWidth); // Minimum width of 1200px on mobile
    }

    return Math.max(width, totalWidth);
  };

  // Calculate adjusted height for vertical root layout
  const calculateAdjustedHeight = () => {
    if (!data || data.length === 0) return height;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    // Height based on number of roots, with adequate spacing
    const totalHeight = 10 + (data.length - 1) * 80 + 40; // 10px from top + spacing between capacities + 40px from end

    // On mobile, limit maximum height to avoid vertical scroll
    if (isMobile) {
      const maxMobileHeight = 512; // 32rem = 512px
      return Math.min(totalHeight, maxMobileHeight);
    }

    // On desktop, use minimum height of 800px
    const minDesktopHeight = 800;
    return Math.max(minDesktopHeight, totalHeight);
  };

  const adjustedWidth = calculateAdjustedWidth();
  const adjustedHeight = calculateAdjustedHeight();

  return (
    <div className="w-full">
      {/* CSS to hide scrollbars */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .dark-theme {
          background-color: #053749 !important;
          color: #f3f4f6 !important;
        }

        .light-theme {
          background-color: #fafafa !important;
          color: #222 !important;
        }
      `}</style>

      {/* Title and description moved outside container with limited height */}
      <div className="mb-4 w-full mt-20">
        <h2
          className="text-xl font-semibold mb-2 break-words w-full"
          style={{
            wordBreak: 'break-word',
            color: darkMode ? '#f3f4f6' : '#111827', // text-white : text-gray-900
          }}
        >
          {pageContent['capacity-visualization-title'] || 'Visualização Interativa das Capacidades'}
        </h2>
        <p
          className="text-sm mb-4 break-words w-full"
          style={{
            wordBreak: 'break-word',
            color: darkMode ? '#f3f4f6' : '#4b5563', // text-white : text-gray-600
          }}
        >
          {pageContent['capacity-visualization-description'] ||
           'Clique nas capacidades principais para expandir/colapsar e focar • Clique nos ícones para ver detalhes e centralizar automaticamente • Use o mouse para fazer zoom e arrastar • Clique em "Retornar a visualização inicial" para resetar o foco'}
        </p>

        {/* Control buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={showAllCapacities}
            className="px-4 py-2 bg-capx-secondary-purple hover:bg-capx-secondary-purple/80 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {pageContent['capacity-visualization-reset-button'] || 'Retornar à visualização inicial'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* D3 Visualization */}
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
              key={`svg-${darkMode}-${forceUpdate}`}
              ref={svgRef}
              width="100%"
              height={svgHeight}
              viewBox={`0 0 ${adjustedWidth} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
              className={darkMode ? 'dark-theme' : 'light-theme'}
              style={{
                backgroundColor: darkMode ? '#053749' : '#fafafa',
                color: darkMode ? '#f3f4f6' : '#222',
                maxWidth: '100%',
                display: 'block',
              }}
            />
          </div>
        </div>

        {/* Capacity details */}
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
                <p className="leading-relaxed" style={{ color: darkMode ? '#d1d5db' : '#374151' }}>
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

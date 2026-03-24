'use client';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useUserCapacities } from '@/hooks/useUserCapacities';
import { getCapacityColor } from '@/lib/utils/capacitiesUtils';
import BarCodeIcon from '@/public/static/images/barcode.svg';
import BarCodeLightIcon from '@/public/static/images/barcode_white.svg';
import MetabaseIcon from '@/public/static/images/metabase_black.svg';
import MetabaseLightIcon from '@/public/static/images/metabase_light.svg';
import { profileService } from '@/services/profileService';
import { userService } from '@/services/userService';
import { useDarkMode, usePageContent, useSetDarkMode } from '@/stores';
import { UserProfile } from '@/types/user';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as d3 from 'd3';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

interface D3Capacity {
  id: string;
  code: number;
  name: string;
  color: string;
  description: string;
  wd_code: string;
  metabase_code: string;
  children: D3Capacity[];
  isCenter?: boolean;
}

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

function capitalizeFirst(str: string | undefined | null): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface D3TreeVisualizationProps {
  data: D3Capacity[];
  width?: number;
  height?: number;
}

// Canvas dimensions in SVG user units
const CANVAS_W = 1200;
const CANVAS_H = 700;
const CX = CANVAS_W / 2; // 600
const CY = CANVAS_H / 2; // 350

// Radial distances
const ROOT_RADIUS = 195;
const CHILD_RADIUS = 185;
const GC_RADIUS = 160;

// Logo display size
const LOGO_SIZE = 72;

export default function D3TreeVisualization({ data }: D3TreeVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const savedTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const [selectedNode, setSelectedNode] = useState<D3Capacity | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [focusedRootId, setFocusedRootId] = useState<string | null>(null);
  const darkMode = useDarkMode();
  const setDarkMode = useSetDarkMode();
  const pageContent = usePageContent();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Auth / profile for "Add to" buttons
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();
  const [isAddingKnown, setIsAddingKnown] = useState(false);
  const [isAddingWanted, setIsAddingWanted] = useState(false);

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ['userProfile', session?.user?.id, session?.user?.token],
    queryFn: () =>
      userService.fetchUserProfile(Number(session?.user?.id), session?.user?.token || ''),
    enabled: !!session?.user?.token && !!session?.user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { userKnownCapacities, userAvailableCapacities, userWantedCapacities } =
    useUserCapacities(userProfile);

  const isAddedToKnown = useMemo(
    () =>
      selectedNode
        ? userKnownCapacities.includes(selectedNode.code) &&
          userAvailableCapacities.includes(selectedNode.code)
        : false,
    [userKnownCapacities, userAvailableCapacities, selectedNode]
  );
  const isAddedToWanted = useMemo(
    () => (selectedNode ? userWantedCapacities.includes(selectedNode.code) : false),
    [userWantedCapacities, selectedNode]
  );

  const handleAddToKnown = async () => {
    if (!session?.user?.token || !session?.user?.id) {
      showSnackbar(pageContent['login-required'] || 'Please log in to add capacities', 'error');
      return;
    }
    if (!userProfile || !selectedNode || isAddingKnown || isAddedToKnown) return;
    setIsAddingKnown(true);
    try {
      const code = selectedNode.code;
      const payload: any = {
        skills_known: userKnownCapacities.includes(code)
          ? userKnownCapacities.map(c => c.toString())
          : [...userKnownCapacities, code].map(c => c.toString()),
        skills_available: userAvailableCapacities.includes(code)
          ? userAvailableCapacities.map(c => c.toString())
          : [...userAvailableCapacities, code].map(c => c.toString()),
      };
      if (userProfile.language && Array.isArray(userProfile.language))
        payload.language = userProfile.language;
      const updated: UserProfile = {
        ...userProfile,
        skills_known: payload.skills_known,
        skills_available: payload.skills_available,
      };
      queryClient.setQueryData(['userProfile', session.user.id, session.user.token], updated);
      showSnackbar(pageContent['capacity-added-known'] || 'Capacity added to known', 'success');
      profileService
        .updateProfile(Number(session.user.id), payload, {
          headers: { Authorization: `Token ${session.user.token}` },
        })
        .catch(() =>
          queryClient.invalidateQueries({
            queryKey: ['userProfile', session.user.id, session.user.token],
          })
        );
    } catch {
      showSnackbar(pageContent['error'] || 'Error adding capacity', 'error');
    } finally {
      setIsAddingKnown(false);
    }
  };

  const handleAddToWanted = async () => {
    if (!session?.user?.token || !session?.user?.id) {
      showSnackbar(pageContent['login-required'] || 'Please log in to add capacities', 'error');
      return;
    }
    if (!userProfile || !selectedNode || isAddingWanted || isAddedToWanted) return;
    setIsAddingWanted(true);
    try {
      const code = selectedNode.code;
      const payload: any = {
        skills_wanted: userWantedCapacities.includes(code)
          ? userWantedCapacities.map(c => c.toString())
          : [...userWantedCapacities, code].map(c => c.toString()),
      };
      if (userProfile.language && Array.isArray(userProfile.language))
        payload.language = userProfile.language;
      const updated: UserProfile = { ...userProfile, skills_wanted: payload.skills_wanted };
      queryClient.setQueryData(['userProfile', session.user.id, session.user.token], updated);
      showSnackbar(pageContent['capacity-added-wanted'] || 'Capacity added to wanted', 'success');
      profileService
        .updateProfile(Number(session.user.id), payload, {
          headers: { Authorization: `Token ${session.user.token}` },
        })
        .catch(() =>
          queryClient.invalidateQueries({
            queryKey: ['userProfile', session.user.id, session.user.token],
          })
        );
    } catch {
      showSnackbar(pageContent['error'] || 'Error adding capacity', 'error');
    } finally {
      setIsAddingWanted(false);
    }
  };

  // Root positions computed from data length
  const rootCount = data.length;
  const rootPositions = data.map((_, i) => {
    const angle = (2 * Math.PI * i) / rootCount - Math.PI / 2; // start from top
    return { x: CX + ROOT_RADIUS * Math.cos(angle), y: CY + ROOT_RADIUS * Math.sin(angle), angle };
  });

  // System theme change listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) setDarkMode(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [setDarkMode]);

  // Clear SVG on dark mode change, force redraw
  useEffect(() => {
    setForceUpdate(p => p + 1);
    if (svgRef.current) d3.select(svgRef.current).selectAll('*').remove();
  }, [darkMode]);

  // Center viewport on an SVG-coordinate point.
  // D3 zoom transforms are in SVG user (viewBox) units:
  // a container point (x, y) renders at (tx + x*k, ty + y*k) in viewBox space.
  // To center (x, y) in the viewport (CANVAS_W/2, CANVAS_H/2):
  //   tx = CANVAS_W/2 - x*k,  ty = CANVAS_H/2 - y*k
  const centerOnNode = (x: number, y: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    const k = savedTransformRef.current.k;
    const tx = CANVAS_W / 2 - x * k;
    const ty = CANVAS_H / 2 - y * k;
    const transform = d3.zoomIdentity.translate(tx, ty).scale(k);
    savedTransformRef.current = transform;
    d3.select(svgRef.current)
      .transition()
      .duration(650)
      .ease(d3.easeCubicOut)
      .call(zoomRef.current.transform, transform);
  };

  const showAllCapacities = () => {
    if (!svgRef.current || !zoomRef.current) return;
    savedTransformRef.current = d3.zoomIdentity;
    d3.select(svgRef.current)
      .transition()
      .duration(750)
      .ease(d3.easeCubicOut)
      .call(zoomRef.current.transform, d3.zoomIdentity);
    setFocusedRootId(null);
    setSelectedNode(null);
    setExpandedNodes(new Set());
  };

  const toggleNode = (nodeId: string, isRoot = false) => {
    const next = new Set(expandedNodes);
    if (next.has(nodeId)) {
      next.delete(nodeId);
      if (isRoot) setFocusedRootId(null);
    } else {
      if (isRoot) {
        data.forEach(c => {
          if (c.id !== nodeId) next.delete(c.id);
        });
        setFocusedRootId(nodeId);
      }
      next.add(nodeId);
    }
    setExpandedNodes(next);
  };

  // Main D3 render
  useEffect(() => {
    if (!data?.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const container = svg.append('g').attr('class', 'main-container');

    type NodeDatum = {
      x: number;
      y: number;
      depth: number;
      angle: number;
      data: D3Capacity;
      rootColor: string | null;
      rootId?: string;
    };
    type LinkDatum = {
      source: { x: number; y: number };
      target: { x: number; y: number };
      rootId?: string;
      depth: number;
    };

    const allNodes: NodeDatum[] = [];
    const allLinks: LinkDatum[] = [];

    // Center logo node
    allNodes.push({
      x: CX,
      y: CY,
      depth: -1,
      angle: 0,
      data: {
        id: 'center',
        code: 0,
        name: '',
        color: '',
        description: '',
        wd_code: '',
        metabase_code: '',
        children: [],
        isCenter: true,
      },
      rootColor: null,
    });

    // Root nodes + edges
    data.forEach((cap, i) => {
      const { x: rx, y: ry, angle } = rootPositions[i];
      const rootColor = getColorForCapacity(cap.id);
      allNodes.push({ x: rx, y: ry, depth: 0, data: cap, rootColor, angle, rootId: cap.id });
      allLinks.push({
        source: { x: CX, y: CY },
        target: { x: rx, y: ry },
        rootId: cap.id,
        depth: 0,
      });

      if (!expandedNodes.has(cap.id) || !cap.children?.length) return;

      const nC = cap.children.length;
      const fanHalf = nC === 1 ? 0 : Math.min(Math.PI * 0.55, (nC - 1) * 0.3 + 0.2);

      cap.children.forEach((child, ci) => {
        const cAngle = nC === 1 ? angle : angle - fanHalf + (ci / (nC - 1)) * 2 * fanHalf;
        const cX = rx + CHILD_RADIUS * Math.cos(cAngle);
        const cY = ry + CHILD_RADIUS * Math.sin(cAngle);
        allNodes.push({
          x: cX,
          y: cY,
          depth: 1,
          data: child,
          rootColor,
          angle: cAngle,
          rootId: cap.id,
        });
        allLinks.push({
          source: { x: rx, y: ry },
          target: { x: cX, y: cY },
          rootId: cap.id,
          depth: 1,
        });

        if (!expandedNodes.has(child.id) || !child.children?.length) return;

        const nGc = child.children.length;
        const gcFanHalf = nGc === 1 ? 0 : Math.min(Math.PI * 0.4, (nGc - 1) * 0.24 + 0.14);

        child.children.forEach((gc, gci) => {
          const gcAngle =
            nGc === 1 ? cAngle : cAngle - gcFanHalf + (gci / (nGc - 1)) * 2 * gcFanHalf;
          const gcX = cX + GC_RADIUS * Math.cos(gcAngle);
          const gcY = cY + GC_RADIUS * Math.sin(gcAngle);
          allNodes.push({
            x: gcX,
            y: gcY,
            depth: 2,
            data: gc,
            rootColor,
            angle: gcAngle,
            rootId: cap.id,
          });
          allLinks.push({
            source: { x: cX, y: cY },
            target: { x: gcX, y: gcY },
            rootId: cap.id,
            depth: 2,
          });
        });
      });
    });

    // Draw links
    container
      .selectAll('.link')
      .data(allLinks)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .style('stroke', '#9ca3af')
      .style('stroke-width', d => (d.depth === 0 ? '2px' : '1.5px'))
      .style('opacity', d => (focusedRootId && d.rootId !== focusedRootId ? 0.12 : 0.65));

    // Draw nodes
    const nodeG = container
      .selectAll('.node')
      .data(allNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', d => (d.data.isCenter ? 'default' : 'pointer'))
      .on('click', (_event, d) => {
        if (d.data.isCenter) return;
        setSelectedNode(d.data);
        if (d.depth === 0) {
          centerOnNode(d.x, d.y);
          toggleNode(d.data.id, true);
        } else if (d.depth === 1) {
          toggleNode(d.data.id, false);
        }
      })
      .on('mouseover', function (_, d) {
        if (d.data.isCenter) return;
        d3.select(this)
          .select('path')
          .transition()
          .duration(150)
          .style('stroke', '#fbbf24')
          .style('stroke-width', '3px');
      })
      .on('mouseout', function (_, d) {
        if (d.data.isCenter) return;
        const isSelected = selectedNode?.id === d.data.id;
        d3.select(this)
          .select('path')
          .transition()
          .duration(150)
          .style('stroke', isSelected ? '#fbbf24' : '#ffffff')
          .style('stroke-width', isSelected ? '3px' : '2px');
      });

    // Center logo
    nodeG
      .filter(d => !!d.data.isCenter)
      .append('image')
      .attr('href', '/static/images/capx_minimalistic_logo.svg')
      .attr('x', -LOGO_SIZE / 2)
      .attr('y', -LOGO_SIZE / 2)
      .attr('width', LOGO_SIZE)
      .attr('height', LOGO_SIZE);

    // Hexagon nodes
    nodeG
      .filter(d => !d.data.isCenter)
      .each(function (d) {
        const r = d.depth === 0 ? 13 : d.depth === 1 ? 10 : 8;
        const fill = d.rootColor ? getCapacityColor(d.rootColor) : '#6b7280';
        const nodeOpacity =
          focusedRootId && d.depth === 0 && d.data.id !== focusedRootId ? 0.18 : 1;
        const stroke = selectedNode?.id === d.data.id ? '#fbbf24' : '#ffffff';
        const sw = selectedNode?.id === d.data.id ? '3px' : '2px';
        const pts = Array.from({ length: 6 }, (_, k) => {
          const a = (k * Math.PI) / 3;
          return `${Math.cos(a) * r},${Math.sin(a) * r}`;
        }).join(' L ');
        d3.select(this)
          .append('path')
          .attr('d', `M ${pts} Z`)
          .style('fill', fill)
          .style('stroke', stroke)
          .style('stroke-width', sw)
          .style('opacity', nodeOpacity);
      });

    // Labels
    nodeG
      .filter(d => !d.data.isCenter)
      .append('text')
      .attr('x', d => {
        const offset = d.depth === 0 ? 18 : 15;
        return Math.cos(d.angle) * offset;
      })
      .attr('y', d => {
        const offset = d.depth === 0 ? 18 : 15;
        return Math.sin(d.angle) * offset;
      })
      .attr('dy', '.35em')
      .style('text-anchor', d => {
        const cos = Math.cos(d.angle);
        if (Math.abs(cos) < 0.25) return 'middle';
        return cos > 0 ? 'start' : 'end';
      })
      .text(d => capitalizeFirst(d.data.name))
      .style('font-size', d => (d.depth === 0 ? '13px' : d.depth === 1 ? '11px' : '10px'))
      .style('fill', darkMode ? '#f3f4f6' : '#111827')
      .style('font-weight', d => (d.depth === 0 ? '600' : '400'))
      .style('pointer-events', 'none')
      .style('opacity', d => {
        if (focusedRootId && d.depth === 0 && d.data.id !== focusedRootId) return 0.18;
        return 1;
      });

    // D3 zoom + pan
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', event => {
        container.attr('transform', event.transform.toString());
        savedTransformRef.current = event.transform;
      });
    svg.call(zoom);
    zoomRef.current = zoom;

    // Restore saved transform (preserve position across re-renders)
    svg.call(zoom.transform, savedTransformRef.current);

    // Click on background to deselect
    svg.on('click', event => {
      if (event.target === svgRef.current) setSelectedNode(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, expandedNodes, selectedNode, focusedRootId, darkMode, forceUpdate]);

  return (
    <div className="w-full">
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="mb-4 w-full">
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: darkMode ? '#f3f4f6' : '#111827' }}
        >
          {pageContent['capacity-visualization-title'] || 'Visualização Interativa das Capacidades'}
        </h2>
        <p className="text-sm mb-4" style={{ color: darkMode ? '#d1d5db' : '#4b5563' }}>
          {pageContent['capacity-visualization-description'] ||
            'Clique nas capacidades principais para expandir e centralizar • Use scroll/pinch para zoom • Arraste para navegar'}
        </p>
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
            {pageContent['capacity-visualization-reset-button'] ||
              'Retornar à visualização inicial'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 relative">
          <div
            className="w-full border border-gray-200 dark:border-gray-700 rounded-lg hide-scrollbar overflow-hidden"
            style={{
              height: 520,
              backgroundColor: darkMode ? '#053749' : '#fafafa',
            }}
          >
            <svg
              key={`svg-${darkMode}-${forceUpdate}`}
              ref={svgRef}
              width="100%"
              height={520}
              viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
              preserveAspectRatio="xMidYMid meet"
              style={{
                backgroundColor: darkMode ? '#053749' : '#fafafa',
                display: 'block',
              }}
            />
          </div>
        </div>

        {selectedNode && !selectedNode.isCenter && (
          <div className="lg:w-80 flex-shrink-0">
            <div
              className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-4"
              style={{ backgroundColor: darkMode ? '#1f2937' : '#fafafa' }}
            >
              {/* Name */}
              <h3 className="text-lg font-bold" style={{ color: darkMode ? '#f3f4f6' : '#111827' }}>
                {capitalizeFirst(selectedNode.name)}
              </h3>

              {/* Metabase + Wikidata links */}
              {(selectedNode.metabase_code || selectedNode.wd_code) && (
                <div className="flex flex-row gap-4 flex-wrap">
                  {selectedNode.metabase_code && (
                    <a
                      href={`https://metabase.wikibase.cloud/wiki/Item:${selectedNode.metabase_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={pageContent['capacity-card-visit-metabase'] || 'Visit on Metabase'}
                      className="flex flex-row items-center gap-2"
                    >
                      <div className="relative w-6 h-6 flex-shrink-0">
                        <Image
                          src={darkMode ? MetabaseLightIcon : MetabaseIcon}
                          alt="Metabase"
                          fill
                        />
                      </div>
                      <span
                        className={`text-sm underline break-all ${darkMode ? 'text-blue-400' : 'text-capx-light-link'}`}
                      >
                        {selectedNode.metabase_code}
                      </span>
                    </a>
                  )}
                  {selectedNode.wd_code && (
                    <a
                      href={`https://www.wikidata.org/wiki/${selectedNode.wd_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={pageContent['capacity-card-visit-wikidata'] || 'Visit on Wikidata'}
                      className="flex flex-row items-center gap-2"
                    >
                      <div className="relative w-6 h-6 flex-shrink-0">
                        <Image
                          src={darkMode ? BarCodeLightIcon : BarCodeIcon}
                          alt="Wikidata"
                          fill
                        />
                      </div>
                      <span
                        className={`text-sm underline break-all ${darkMode ? 'text-blue-400' : 'text-capx-light-link'}`}
                      >
                        {selectedNode.wd_code}
                      </span>
                    </a>
                  )}
                </div>
              )}

              {/* Description */}
              {selectedNode.description && (
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: darkMode ? '#d1d5db' : '#374151' }}
                >
                  {selectedNode.description}
                </p>
              )}

              {/* Add to Known / Wanted buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleAddToKnown}
                  disabled={
                    isAddingKnown ||
                    isAddedToKnown ||
                    isProfileLoading ||
                    isProfileError ||
                    !userProfile ||
                    !session?.user?.token
                  }
                  className={`w-full px-3 py-2 rounded-md text-sm font-semibold text-white transition-opacity ${
                    isAddedToKnown ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: '#507380' }}
                >
                  {isAddedToKnown
                    ? pageContent['capacity-card-added-to-known'] || '✓ Added to Known'
                    : isAddingKnown || isProfileLoading
                      ? pageContent['loading'] || 'Loading...'
                      : pageContent['capacity-card-add-to-known'] || 'Add to Known'}
                </button>
                <button
                  onClick={handleAddToWanted}
                  disabled={
                    isAddingWanted ||
                    isAddedToWanted ||
                    isProfileLoading ||
                    isProfileError ||
                    !userProfile ||
                    !session?.user?.token
                  }
                  className={`w-full px-3 py-2 rounded-md text-sm font-semibold text-white transition-opacity ${
                    isAddedToWanted ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                  }`}
                  style={{ backgroundColor: '#507380' }}
                >
                  {isAddedToWanted
                    ? pageContent['capacity-card-added-to-wanted'] || '✓ Added to Wanted'
                    : isAddingWanted || isProfileLoading
                      ? pageContent['loading'] || 'Loading...'
                      : pageContent['capacity-card-add-to-wanted'] || 'Add to Wanted'}
                </button>
              </div>

              {/* Info note */}
              <p
                className="text-xs leading-relaxed border-t pt-3"
                style={{
                  color: darkMode ? '#9ca3af' : '#6b7280',
                  borderColor: darkMode ? '#374151' : '#e5e7eb',
                }}
              >
                {pageContent['capacity-card-profile-info'] ||
                  'This will be added to your personal profile.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

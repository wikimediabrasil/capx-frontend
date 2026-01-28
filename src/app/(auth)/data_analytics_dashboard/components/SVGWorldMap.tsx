'use client';

import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getCapacityTotalsByWikimediaTerritory,
  getLanguageTotalsByWikimediaTerritory,
} from '@/hooks/useAggregatedTerritoryData';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  WIKIMEDIA_TERRITORIES,
  WikimediaTerritory,
  getTerritoryByCountry,
  ISO_ALPHA2_TO_ALPHA3,
  buildApiTerritoryToWikimediaMap,
} from './wikimediaTerritories';

interface AggregatedLanguageData {
  [territoryId: string]: { [languageId: string]: number };
}

interface AggregatedCapacityData {
  [territoryId: string]: {
    [capacityId: string]: { available: number; wanted: number };
  };
}

interface SVGWorldMapProps {
  languageUserCounts?: Record<string, number>;
  languages?: Record<string, string>;
  skillAvailableCounts?: Record<string, number>;
  skillWantedCounts?: Record<string, number>;
  territoryUserCounts?: Record<string, number>;
  territories?: Record<string, string>;
  capacities?: Record<string, string>;
  languagesByTerritory?: AggregatedLanguageData;
  capacitiesByTerritory?: AggregatedCapacityData;
  isAggregatedDataLoading?: boolean;
  totalUsers?: number;
}

// View mode type
type ViewMode = 'users' | 'languages' | 'capacities';

// Map orientation type
type MapOrientation = 'north-up' | 'south-up';

// Unique colors for each Wikimedia territory when selected (using system colors)
const TERRITORY_COLORS: Record<string, string> = {
  SSA: '#D43831',    // capx-primary-orange - Sub-Saharan Africa
  NWE: '#27AE60',    // technology green - Northern & Western Europe
  ESEAP: '#851d6a',  // capx-secondary-purple - East, Southeast Asia & Pacific
  LAC: '#02AE8C',    // capx-primary-green - Latin America & Caribbean
  CEECA: '#D43420',  // capx-primary-red - Central & Eastern Europe & Central Asia
  SA: '#f0c626',     // capx-primary-yellow - South Asia
  MENA: '#BE0078',   // communication magenta - Middle East & North Africa
  NA: '#717171',     // capx-secondary-grey - North America
};


export default function SVGWorldMap({
  languageUserCounts,
  languages,
  skillAvailableCounts,
  skillWantedCounts,
  territoryUserCounts,
  territories,
  capacities,
  languagesByTerritory,
  capacitiesByTerritory,
  isAggregatedDataLoading,
  totalUsers: totalUsersProp,
}: SVGWorldMapProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const { darkMode } = useTheme();
  const { pageContent, isMobile } = useApp();
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('users');
  const [selectedTerritory, setSelectedTerritory] = useState<WikimediaTerritory | null>(null);
  const [hoveredTerritory, setHoveredTerritory] = useState<WikimediaTerritory | null>(null);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('all');
  const [selectedCapacityId, setSelectedCapacityId] = useState<string>('all');
  const [mapOrientation, setMapOrientation] = useState<MapOrientation>('north-up');

  // Create API territory ID to Wikimedia ID mapping (uses fallback if territories unavailable)
  const apiTerritoryToWikimediaMap = useMemo(() => {
    return buildApiTerritoryToWikimediaMap(territories);
  }, [territories]);

  // Map API territories to Wikimedia territory counts
  const wikimediaTerritoryUserCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    if (!territoryUserCounts) {
      return counts;
    }

    // Use the apiTerritoryToWikimediaMap which has fallback logic built in
    Object.entries(territoryUserCounts).forEach(([id, count]) => {
      const wikimediaId = apiTerritoryToWikimediaMap[id];
      if (wikimediaId) {
        counts[wikimediaId] = (counts[wikimediaId] || 0) + count;
      }
    });

    return counts;
  }, [territoryUserCounts, apiTerritoryToWikimediaMap]);

  // Get language counts by Wikimedia territory for selected language (or all languages)
  const languageCountsByWikimediaTerritory = useMemo(() => {
    if (!languagesByTerritory) return {};

    // For "all", sum all language users per territory
    if (selectedLanguageId === 'all') {
      const counts: Record<string, number> = {};
      Object.entries(languagesByTerritory).forEach(([apiTerritoryId, langCounts]) => {
        const wikimediaId = apiTerritoryToWikimediaMap[apiTerritoryId];
        if (wikimediaId) {
          const totalForTerritory = Object.values(langCounts).reduce((sum, count) => sum + count, 0);
          counts[wikimediaId] = (counts[wikimediaId] || 0) + totalForTerritory;
        }
      });
      return counts;
    }

    return getLanguageTotalsByWikimediaTerritory(
      languagesByTerritory,
      apiTerritoryToWikimediaMap,
      selectedLanguageId
    );
  }, [languagesByTerritory, apiTerritoryToWikimediaMap, selectedLanguageId]);

  // Get capacity counts by Wikimedia territory for selected capacity (or all capacities)
  const capacityCountsByWikimediaTerritory = useMemo(() => {
    if (!capacitiesByTerritory) return {};

    // For "all", sum all capacity users per territory
    if (selectedCapacityId === 'all') {
      const counts: Record<string, { available: number; wanted: number; total: number }> = {};
      Object.entries(capacitiesByTerritory).forEach(([apiTerritoryId, capCounts]) => {
        const wikimediaId = apiTerritoryToWikimediaMap[apiTerritoryId];
        if (wikimediaId) {
          if (!counts[wikimediaId]) {
            counts[wikimediaId] = { available: 0, wanted: 0, total: 0 };
          }
          Object.values(capCounts).forEach(({ available, wanted }) => {
            counts[wikimediaId].available += available;
            counts[wikimediaId].wanted += wanted;
            counts[wikimediaId].total += available + wanted;
          });
        }
      });
      return counts;
    }

    return getCapacityTotalsByWikimediaTerritory(
      capacitiesByTerritory,
      apiTerritoryToWikimediaMap,
      selectedCapacityId
    );
  }, [capacitiesByTerritory, apiTerritoryToWikimediaMap, selectedCapacityId]);

  // Get max value for current view mode
  const maxCount = useMemo(() => {
    let values: number[] = [];

    switch (viewMode) {
      case 'languages':
        values = Object.values(languageCountsByWikimediaTerritory);
        break;
      case 'capacities':
        values = Object.values(capacityCountsByWikimediaTerritory).map((c) => c.total);
        break;
      default:
        values = Object.values(wikimediaTerritoryUserCounts);
    }

    return values.length > 0 ? Math.max(...values) : 1;
  }, [viewMode, wikimediaTerritoryUserCounts, languageCountsByWikimediaTerritory, capacityCountsByWikimediaTerritory]);

  // Get total users - use prop if available, otherwise calculate from territories
  const totalUsers = useMemo(() => {
    if (totalUsersProp !== undefined) return totalUsersProp;
    return Object.values(wikimediaTerritoryUserCounts).reduce((sum, count) => sum + count, 0);
  }, [totalUsersProp, wikimediaTerritoryUserCounts]);

  // Sort languages by user count
  const sortedLanguages = useMemo(() => {
    if (!languages || !languageUserCounts) return [];
    return Object.entries(languages)
      .map(([id, name]) => ({ id, name, count: languageUserCounts[id] || 0 }))
      .filter((lang) => lang.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [languages, languageUserCounts]);

  // Get capacities list - use all capacities from the capacities prop
  const capacitiesList = useMemo(() => {
    if (!capacities) return [];

    // Build list from all capacities that have users
    return Object.entries(capacities)
      .map(([id, name]) => ({
        id,
        name,
        available: skillAvailableCounts?.[id] || 0,
        wanted: skillWantedCounts?.[id] || 0,
        total: (skillAvailableCounts?.[id] || 0) + (skillWantedCounts?.[id] || 0),
      }))
      .filter((cap) => cap.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [capacities, skillAvailableCounts, skillWantedCounts]);

  // Get top languages for the selected/hovered territory
  const getTopLanguagesForTerritory = useCallback(
    (territory: WikimediaTerritory) => {
      if (!languagesByTerritory || !languages) return [];

      const langCounts: Record<string, number> = {};

      // Find all API territory IDs that map to this Wikimedia territory
      Object.entries(apiTerritoryToWikimediaMap).forEach(([apiTerritoryId, wikimediaId]) => {
        if (wikimediaId === territory.id && languagesByTerritory[apiTerritoryId]) {
          Object.entries(languagesByTerritory[apiTerritoryId]).forEach(([langId, count]) => {
            langCounts[langId] = (langCounts[langId] || 0) + count;
          });
        }
      });

      return Object.entries(langCounts)
        .map(([id, count]) => ({ id, name: languages[id] || `Language ${id}`, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    },
    [languagesByTerritory, languages, apiTerritoryToWikimediaMap]
  );

  // Get top capacities for the selected/hovered territory
  const getTopCapacitiesForTerritory = useCallback(
    (territory: WikimediaTerritory) => {
      if (!capacitiesByTerritory || !capacities) return [];

      const capCounts: Record<string, { available: number; wanted: number }> = {};

      // Find all API territory IDs that map to this Wikimedia territory
      Object.entries(apiTerritoryToWikimediaMap).forEach(([apiTerritoryId, wikimediaId]) => {
        if (wikimediaId === territory.id && capacitiesByTerritory[apiTerritoryId]) {
          Object.entries(capacitiesByTerritory[apiTerritoryId]).forEach(([capId, { available, wanted }]) => {
            if (!capCounts[capId]) {
              capCounts[capId] = { available: 0, wanted: 0 };
            }
            capCounts[capId].available += available;
            capCounts[capId].wanted += wanted;
          });
        }
      });

      return Object.entries(capCounts)
        .map(([id, { available, wanted }]) => ({
          id,
          name: capacities[id] || `Capacity ${id}`,
          available,
          wanted,
          total: available + wanted,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    },
    [capacitiesByTerritory, capacities, apiTerritoryToWikimediaMap]
  );

  // Get count for territory based on view mode
  const getTerritoryCount = useCallback(
    (territory: WikimediaTerritory): number => {
      switch (viewMode) {
        case 'languages':
          return languageCountsByWikimediaTerritory[territory.id] || 0;
        case 'capacities':
          return capacityCountsByWikimediaTerritory[territory.id]?.total || 0;
        default:
          return wikimediaTerritoryUserCounts[territory.id] || 0;
      }
    },
    [viewMode, wikimediaTerritoryUserCounts, languageCountsByWikimediaTerritory, capacityCountsByWikimediaTerritory]
  );

  // Get color for territory based on count and selection state
  const getTerritoryColor = useCallback(
    (territory: WikimediaTerritory | undefined): string => {
      if (!territory) {
        return darkMode ? '#1A2F3A' : '#E5E5E5';
      }

      const isSelected = selectedTerritory?.id === territory.id;
      const isHovered = hoveredTerritory?.id === territory.id;

      // Use unique territory color when selected
      if (isSelected) {
        return TERRITORY_COLORS[territory.id] || (darkMode ? '#339ED6' : '#0070B9');
      }

      const count = getTerritoryCount(territory);
      const intensity = maxCount > 0 ? count / maxCount : 0;

      let baseColor: string;
      let lightColor: string;

      switch (viewMode) {
        case 'languages':
          baseColor = darkMode ? '#10B85C' : '#0B8E46';
          lightColor = darkMode ? '#1A2F3A' : '#E8F4FC';
          break;
        case 'capacities':
          baseColor = darkMode ? '#B02890' : '#851D6A';
          lightColor = darkMode ? '#1A2F3A' : '#E8F4FC';
          break;
        default:
          baseColor = darkMode ? '#339ED6' : '#0070B9';
          lightColor = darkMode ? '#1A2F3A' : '#E8F4FC';
      }

      // Interpolate between light and base color based on intensity
      const r1 = parseInt(lightColor.slice(1, 3), 16);
      const g1 = parseInt(lightColor.slice(3, 5), 16);
      const b1 = parseInt(lightColor.slice(5, 7), 16);
      const r2 = parseInt(baseColor.slice(1, 3), 16);
      const g2 = parseInt(baseColor.slice(3, 5), 16);
      const b2 = parseInt(baseColor.slice(5, 7), 16);

      const r = Math.round(r1 + (r2 - r1) * intensity);
      const g = Math.round(g1 + (g2 - g1) * intensity);
      const b = Math.round(b1 + (b2 - b1) * intensity);

      let color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

      if (isHovered) {
        // Brighten the color slightly on hover
        const brighten = 30;
        const rH = Math.min(255, r + brighten);
        const gH = Math.min(255, g + brighten);
        const bH = Math.min(255, b + brighten);
        color = `#${rH.toString(16).padStart(2, '0')}${gH.toString(16).padStart(2, '0')}${bH.toString(16).padStart(2, '0')}`;
      }

      return color;
    },
    [darkMode, selectedTerritory, hoveredTerritory, getTerritoryCount, maxCount, viewMode]
  );

  // Load SVG content
  useEffect(() => {
    fetch('/static/images/BlankMap-World.svg')
      .then((response) => response.text())
      .then((text) => {
        setSvgContent(text);
      })
      .catch((error) => {
        console.error('Error loading SVG:', error);
      });
  }, []);

  // Apply colors and event handlers to SVG
  useEffect(() => {
    if (!svgContainerRef.current || !svgContent) return;

    const container = svgContainerRef.current;
    container.innerHTML = svgContent;

    const svg = container.querySelector('svg');
    if (!svg) return;

    // Get original dimensions and set viewBox for proper scaling
    const originalWidth = 2754;
    const originalHeight = 1398;

    // Set viewBox if not already set (allows proper scaling)
    if (!svg.getAttribute('viewBox')) {
      svg.setAttribute('viewBox', `0 0 ${originalWidth} ${originalHeight}`);
    }

    // Remove fixed width/height and use CSS for responsive sizing
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.style.width = '100%';
    svg.style.height = 'auto';
    svg.style.maxHeight = isMobile ? '280px' : '450px';
    svg.style.display = 'block';

    // Apply rotation for south-up orientation
    if (mapOrientation === 'south-up') {
      svg.style.transform = 'rotate(180deg)';
    } else {
      svg.style.transform = 'none';
    }

    // Find all elements with country classes (both <path> and <g> elements)
    const landElements = svg.querySelectorAll('.landxx');

    landElements.forEach((element) => {
      const elementId = element.getAttribute('id') || '';
      const classList = element.getAttribute('class') || '';
      const classes = classList.split(' ');

      // Find the country code - first try from element ID, then from classes
      let countryCode: string | null = null;

      // Try element ID first (e.g., id="br" for Brazil, id="au" for Australia)
      if (elementId && elementId.length === 2 && ISO_ALPHA2_TO_ALPHA3[elementId.toLowerCase()]) {
        countryCode = elementId.toLowerCase();
      } else {
        // Look in class list for 2-letter country codes
        for (const cls of classes) {
          const lowerCls = cls.toLowerCase();
          // Skip 'id' here as it conflicts with HTML id attribute - handled separately below
          if (lowerCls.length === 2 && lowerCls !== 'id' && ISO_ALPHA2_TO_ALPHA3[lowerCls]) {
            countryCode = lowerCls;
            break;
          }
        }
        // Special case: handle Indonesia which has id="id" or class containing "id"
        // This handles both the parent <g id="id"> and child paths like <path class="landxx id">
        if (!countryCode && (elementId.toLowerCase() === 'id' || classes.includes('id'))) {
          countryCode = 'id';
        }
      }

      const territory = countryCode ? getTerritoryByCountry(countryCode) : undefined;
      const color = getTerritoryColor(territory);

      // Apply styles - handle both <path> and <g> elements
      if (element.tagName.toLowerCase() === 'g') {
        // For group elements, apply fill to all child paths
        const childPaths = element.querySelectorAll('path');
        childPaths.forEach((childPath) => {
          (childPath as SVGPathElement).style.fill = color;
          (childPath as SVGPathElement).style.transition = 'fill 0.2s ease';
        });
        (element as SVGGElement).style.cursor = territory ? 'pointer' : 'default';
      } else {
        // For path elements, apply fill directly
        (element as SVGPathElement).style.fill = color;
        (element as SVGPathElement).style.cursor = territory ? 'pointer' : 'default';
        (element as SVGPathElement).style.transition = 'fill 0.2s ease';
      }

      if (territory) {
        // Add event listeners only for elements with territories
        element.addEventListener('mouseenter', () => {
          setHoveredTerritory(territory);
        });

        element.addEventListener('mouseleave', () => {
          setHoveredTerritory(null);
        });

        element.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedTerritory((prev) =>
            prev?.id === territory.id ? null : territory
          );
        });
      }
    });

    // Update ocean color and remove its border
    const ocean = svg.querySelector('#ocean');
    if (ocean) {
      (ocean as SVGPathElement).style.fill = darkMode ? '#04222F' : '#FAFAFA';
      (ocean as SVGPathElement).style.stroke = 'none';
    }

    // Remove strokes from all land elements to eliminate country borders
    const allLandPaths = svg.querySelectorAll('.landxx');
    allLandPaths.forEach((landPath) => {
      (landPath as SVGPathElement).style.stroke = 'none';
    });

  }, [svgContent, darkMode, mapOrientation, isMobile, getTerritoryColor, selectedTerritory, hoveredTerritory]);

  // Get view mode title
  const getViewModeTitle = () => {
    switch (viewMode) {
      case 'languages':
        return pageContent['analytics-map-languages-by-territory'] || 'Languages by Territory';
      case 'capacities':
        return pageContent['analytics-map-capacities-by-territory'] || 'Capacities by Territory';
      default:
        return pageContent['analytics-map-user-density'] || 'Wikimedian Density by Territory';
    }
  };

  // Get gradient colors based on view mode
  const getGradientColors = () => {
    const lightColor = darkMode ? '#1A2F3A' : '#E8F4FC';

    switch (viewMode) {
      case 'languages':
        return { light: lightColor, dark: darkMode ? '#10B85C' : '#0B8E46' };
      case 'capacities':
        return { light: lightColor, dark: darkMode ? '#B02890' : '#851D6A' };
      default:
        return { light: lightColor, dark: darkMode ? '#339ED6' : '#0070B9' };
    }
  };

  const gradientColors = getGradientColors();
  const selectedLanguage = sortedLanguages.find((l) => l.id === selectedLanguageId);
  const selectedCapacity = capacitiesList.find((c) => c.id === selectedCapacityId);

  return (
    <div className="w-full">
      {/* View Mode Toggle */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setViewMode('users')}
          className={`px-4 py-2 rounded-lg font-[Montserrat] text-sm font-semibold transition-colors ${
            viewMode === 'users'
              ? 'bg-capx-primary-blue text-white'
              : darkMode
              ? 'bg-capx-dark-bg text-white/70 hover:bg-capx-dark-bg/80'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {pageContent['analytics-map-filter-users'] || 'Wikimedians'}
        </button>
        <button
          onClick={() => setViewMode('languages')}
          className={`px-4 py-2 rounded-lg font-[Montserrat] text-sm font-semibold transition-colors ${
            viewMode === 'languages'
              ? 'bg-capx-primary-green text-white'
              : darkMode
              ? 'bg-capx-dark-bg text-white/70 hover:bg-capx-dark-bg/80'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {pageContent['analytics-bashboard-languages-title'] || 'Languages'}
        </button>
        <button
          onClick={() => setViewMode('capacities')}
          className={`px-4 py-2 rounded-lg font-[Montserrat] text-sm font-semibold transition-colors ${
            viewMode === 'capacities'
              ? 'bg-capx-secondary-purple text-white'
              : darkMode
              ? 'bg-capx-dark-bg text-white/70 hover:bg-capx-dark-bg/80'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {pageContent['analytics-bashboard-capacities-title'] || 'Capacities'}
        </button>

        {/* Map Orientation Toggle */}
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`font-[Montserrat] text-xs ${
              darkMode ? 'text-white/70' : 'text-gray-500'
            }`}
          >
            {pageContent['analytics-map-orientation'] || 'Orientation'}:
          </span>
          <button
            onClick={() =>
              setMapOrientation((prev) =>
                prev === 'north-up' ? 'south-up' : 'north-up'
              )
            }
            className={`px-3 py-1.5 rounded-lg font-[Montserrat] text-xs font-semibold transition-all flex items-center gap-1.5 ${
              mapOrientation === 'south-up'
                ? 'bg-capx-primary-green text-white'
                : darkMode
                ? 'bg-capx-dark-bg text-white/70 hover:bg-capx-dark-bg/80'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={
              mapOrientation === 'north-up'
                ? pageContent['analytics-map-switch-south-up'] || 'Switch to South-up view'
                : pageContent['analytics-map-switch-north-up'] || 'Switch to North-up view'
            }
          >
            <span
              className={`inline-block transition-transform duration-300 ${
                mapOrientation === 'south-up' ? 'rotate-180' : ''
              }`}
            >
              🌍
            </span>
            {mapOrientation === 'north-up'
              ? pageContent['analytics-map-north-up'] || 'North ↑'
              : pageContent['analytics-map-south-up'] || 'South ↑'}
          </button>
        </div>
      </div>

      {/* Map Title */}
      <div className="mb-4">
        <h3 className={`font-[Montserrat] text-lg font-bold ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}>
          {getViewModeTitle()}
        </h3>
        {viewMode === 'users' && (
          <p className={`font-[Montserrat] text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
            {pageContent['analytics-map-total-users'] || 'Total Wikimedians'}: {totalUsers.toLocaleString()}
          </p>
        )}
      </div>

      {/* Language Selector (for languages view) */}
      {viewMode === 'languages' && (
        <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
          <label
            htmlFor="language-select"
            className={`font-[Montserrat] font-medium text-sm ${
              darkMode ? 'text-white/70' : 'text-gray-600'
            }`}
          >
            {pageContent['analytics-map-select-language'] || 'Select a language'}:
          </label>
          <select
            id="language-select"
            value={selectedLanguageId}
            onChange={(e) => setSelectedLanguageId(e.target.value)}
            className={`flex-1 md:flex-none md:min-w-[300px] px-4 py-2 rounded-lg font-[Montserrat] text-sm border ${
              darkMode
                ? 'bg-capx-dark-bg border-capx-dark-box-bg text-white'
                : 'bg-white border-gray-300 text-capx-dark-box-bg'
            } focus:outline-none focus:ring-2 focus:ring-capx-primary-green`}
          >
            <option value="all">{pageContent['analytics-map-all-languages'] || 'All Languages'}</option>
            {sortedLanguages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name} ({lang.count.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Capacity Selector (for capacities view) */}
      {viewMode === 'capacities' && (
        <div className="mb-4 flex flex-col md:flex-row md:items-center gap-2">
          <label
            htmlFor="capacity-select"
            className={`font-[Montserrat] font-medium text-sm ${
              darkMode ? 'text-white/70' : 'text-gray-600'
            }`}
          >
            {pageContent['analytics-map-select-capacity'] || 'Select a capacity'}:
          </label>
          <select
            id="capacity-select"
            value={selectedCapacityId}
            onChange={(e) => setSelectedCapacityId(e.target.value)}
            className={`flex-1 md:flex-none md:min-w-[300px] px-4 py-2 rounded-lg font-[Montserrat] text-sm border ${
              darkMode
                ? 'bg-capx-dark-bg border-capx-dark-box-bg text-white'
                : 'bg-white border-gray-300 text-capx-dark-box-bg'
            } focus:outline-none focus:ring-2 focus:ring-capx-secondary-purple`}
          >
            <option value="all">{pageContent['analytics-map-all-capacities'] || 'All Capacities'}</option>
            {capacitiesList.map((cap) => (
              <option key={cap.id} value={cap.id}>
                {cap.name} ({cap.total.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* SVG Map Container */}
      <div
        ref={svgContainerRef}
        className={`w-full rounded-lg overflow-hidden ${darkMode ? 'bg-[#04222F]' : 'bg-[#FAFAFA]'}`}
        style={{
          minHeight: isMobile ? '200px' : '300px',
          maxHeight: isMobile ? '280px' : '450px',
        }}
      />

      {/* Legend and Territory Info */}
      <div className="mt-4 flex flex-col md:flex-row gap-4">
        {/* Color Scale Legend */}
        <div className={`flex-1 p-4 rounded-lg ${darkMode ? 'bg-capx-dark-bg' : 'bg-gray-50'}`}>
          <h4 className={`font-[Montserrat] font-bold text-sm mb-2 ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}>
            {pageContent['analytics-map-legend'] || 'Legend'}
          </h4>
          <div className="flex items-center gap-2">
            <span className={`font-[Montserrat] text-xs ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>0</span>
            <div
              className="flex-1 h-4 rounded"
              style={{
                background: `linear-gradient(to right, ${gradientColors.light}, ${gradientColors.dark})`,
              }}
            />
            <span className={`font-[Montserrat] text-xs ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
              {maxCount.toLocaleString()} {pageContent['analytics-bashboard-territory-users'] || 'Wikimedians'}
            </span>
          </div>
        </div>

        {/* Territory Info Panel */}
        {(selectedTerritory || hoveredTerritory) && (
          <div
            className={`flex-1 p-4 rounded-lg border-2 ${darkMode ? 'bg-capx-dark-bg' : 'bg-white'}`}
            style={{
              borderColor: selectedTerritory
                ? TERRITORY_COLORS[selectedTerritory.id]
                : hoveredTerritory
                ? TERRITORY_COLORS[hoveredTerritory.id]
                : 'transparent',
            }}
          >
            {(() => {
              const territory = selectedTerritory || hoveredTerritory;
              if (!territory) return null;

              const count = getTerritoryCount(territory);
              const topLanguages = getTopLanguagesForTerritory(territory);
              const topCapacities = getTopCapacitiesForTerritory(territory);

              return (
                <>
                  <h4
                    className={`font-[Montserrat] font-bold text-lg mb-1 ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}
                    style={{ color: TERRITORY_COLORS[territory.id] }}
                  >
                    {territory.fullName}
                  </h4>
                  <p className={`font-[Montserrat] text-sm mb-2 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
                    {territory.name} · {territory.countries.length} {pageContent['analytics-map-countries-count'] || 'countries'}
                  </p>
                  <p className={`font-[Montserrat] text-sm ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}>
                    {viewMode === 'languages' && selectedLanguage
                      ? `${selectedLanguage.name} ${pageContent['analytics-map-speakers'] || 'speakers'}`
                      : viewMode === 'capacities' && selectedCapacity
                      ? `${selectedCapacity.name} ${pageContent['analytics-bashboard-territory-users'] || 'Wikimedians'}`
                      : pageContent['analytics-bashboard-territory-users'] || 'Wikimedians'}:{' '}
                    <span className={`font-bold ${
                      viewMode === 'languages'
                        ? 'text-capx-primary-green'
                        : viewMode === 'capacities'
                        ? 'text-capx-secondary-purple'
                        : 'text-capx-primary-blue'
                    }`}>
                      {count.toLocaleString()}
                    </span>
                  </p>

                  {/* Top Languages */}
                  {topLanguages.length > 0 && (
                    <div className="mt-3">
                      <p className={`font-[Montserrat] text-xs font-semibold mb-1 ${darkMode ? 'text-white/70' : 'text-gray-500'}`}>
                        {pageContent['analytics-map-top-languages'] || 'Top Languages'}:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {topLanguages.map((lang) => (
                          <span
                            key={lang.id}
                            className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-capx-dark-box-bg text-white/80' : 'bg-gray-100 text-gray-700'}`}
                          >
                            {lang.name} ({lang.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Capacities */}
                  {topCapacities.length > 0 && (
                    <div className="mt-3">
                      <p className={`font-[Montserrat] text-xs font-semibold mb-1 ${darkMode ? 'text-white/70' : 'text-gray-500'}`}>
                        {pageContent['analytics-map-top-capacities'] || 'Top Capacities'}:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {topCapacities.map((cap) => (
                          <span
                            key={cap.id}
                            className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-capx-dark-box-bg text-white/80' : 'bg-gray-100 text-gray-700'}`}
                          >
                            {cap.name} ({cap.total})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTerritory && (
                    <p className={`font-[Montserrat] text-xs mt-2 ${darkMode ? 'text-white/50' : 'text-gray-400'}`}>
                      {pageContent['analytics-map-click-deselect'] || 'Click again to deselect'}
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Territory Grid (when no territory is selected) */}
      {!selectedTerritory && !hoveredTerritory && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {WIKIMEDIA_TERRITORIES.map((territory) => {
            const count = getTerritoryCount(territory);
            return (
              <button
                key={territory.id}
                onClick={() => setSelectedTerritory(territory)}
                className={`p-3 rounded-lg text-left transition-all hover:scale-[1.02] ${
                  darkMode ? 'bg-capx-dark-bg hover:bg-capx-dark-bg/80' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                style={{ borderLeft: `4px solid ${TERRITORY_COLORS[territory.id]}` }}
              >
                <p className={`font-[Montserrat] font-bold text-sm ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}>
                  {territory.fullName}
                </p>
                <p className={`font-[Montserrat] text-xs ${darkMode ? 'text-white/70' : 'text-gray-500'}`}>
                  {territory.name} · {count.toLocaleString()} {pageContent['analytics-bashboard-territory-users'] || 'Wikimedians'}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

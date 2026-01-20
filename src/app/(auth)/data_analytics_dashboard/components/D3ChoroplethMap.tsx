'use client';

import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  getCapacityTotalsByWikimediaTerritory,
  getLanguageTotalsByWikimediaTerritory,
} from '@/hooks/useAggregatedTerritoryData';
import * as d3 from 'd3';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  WIKIMEDIA_TERRITORIES,
  WikimediaTerritory,
  getTerritoryByCountry,
} from './wikimediaTerritories';

interface AggregatedLanguageData {
  [territoryId: string]: { [languageId: string]: number };
}

interface AggregatedCapacityData {
  [territoryId: string]: {
    [capacityId: string]: { available: number; wanted: number };
  };
}

interface D3ChoroplethMapProps {
  languageUserCounts?: Record<string, number>;
  languages?: Record<string, string>;
  skillAvailableCounts?: Record<string, number>;
  skillWantedCounts?: Record<string, number>;
  territoryUserCounts?: Record<string, number>;
  territories?: Record<string, string>;
  languagesByTerritory?: AggregatedLanguageData;
  capacitiesByTerritory?: AggregatedCapacityData;
  isAggregatedDataLoading?: boolean;
  totalUsers?: number;
}

// GeoJSON URL for world map
const WORLD_GEOJSON_URL =
  'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson';

// View mode type
type ViewMode = 'users' | 'languages' | 'capacities';

// Capacity metadata
const CAPACITY_NAMES: Record<string, string> = {
  '10': 'Organizational Structure',
  '36': 'Communication',
  '50': 'Learning and Evaluation',
  '56': 'Community Health Initiative',
  '65': 'Social Skills',
  '74': 'Strategic Management',
  '106': 'Technology',
};

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

// Normalize territory name for matching
function normalizeTerritoryName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Map normalized API territory names to Wikimedia territory IDs
const NORMALIZED_TERRITORY_MAP: Record<string, string> = {
  'middleeastandnorthafricamena': 'MENA',
  'subsaharanafricassa': 'SSA',
  'southasiasa': 'SA',
  'eastsoutheastasiaandpacificeseap': 'ESEAP',
  'latinamericaandcaribbeanlac': 'LAC',
  'northamericana': 'NA',
  'northernandwesterneuropenwe': 'NWE',
  'centralandeasterneuropeandcentralasiaceeca': 'CEECA',
  'subsaharanafrica': 'SSA',
  'northernandwesterneurope': 'NWE',
  'eastsoutheastasiaandthepacific': 'ESEAP',
  'eastsoutheastasiaandpacific': 'ESEAP',
  'latinamericaandthecaribbean': 'LAC',
  'latinamericaandcaribbean': 'LAC',
  'centralandeasterneuropeandcentralasia': 'CEECA',
  'southasia': 'SA',
  'middleeastandnorthafrica': 'MENA',
  'northamerica': 'NA',
  'ssa': 'SSA',
  'nwe': 'NWE',
  'eseap': 'ESEAP',
  'lac': 'LAC',
  'ceeca': 'CEECA',
  'sa': 'SA',
  'mena': 'MENA',
  'na': 'NA',
};

export default function D3ChoroplethMap({
  languageUserCounts,
  languages,
  skillAvailableCounts,
  skillWantedCounts,
  territoryUserCounts,
  territories,
  languagesByTerritory,
  capacitiesByTerritory,
  isAggregatedDataLoading,
  totalUsers: totalUsersProp,
}: D3ChoroplethMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { darkMode } = useTheme();
  const { pageContent, isMobile } = useApp();
  const [geoData, setGeoData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [viewMode, setViewMode] = useState<ViewMode>('users');
  const [selectedTerritory, setSelectedTerritory] = useState<WikimediaTerritory | null>(null);
  const [hoveredTerritory, setHoveredTerritory] = useState<WikimediaTerritory | null>(null);
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('all');
  const [selectedCapacityId, setSelectedCapacityId] = useState<string>('all');

  // Create API territory ID to Wikimedia ID mapping
  const apiTerritoryToWikimediaMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!territories) return map;

    Object.entries(territories).forEach(([id, name]) => {
      const normalizedName = normalizeTerritoryName(name);
      const wikimediaId = NORMALIZED_TERRITORY_MAP[normalizedName];
      if (wikimediaId) {
        map[id] = wikimediaId;
      }
    });

    return map;
  }, [territories]);

  // Map API territories to Wikimedia territory counts
  const wikimediaTerritoryUserCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    if (!territoryUserCounts || !territories) {
      return counts;
    }

    Object.entries(territoryUserCounts).forEach(([id, count]) => {
      const territoryName = territories[id];
      if (territoryName) {
        const normalizedName = normalizeTerritoryName(territoryName);
        const wikimediaId = NORMALIZED_TERRITORY_MAP[normalizedName];

        if (wikimediaId) {
          counts[wikimediaId] = (counts[wikimediaId] || 0) + count;
        }
      }
    });

    return counts;
  }, [territoryUserCounts, territories]);

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

  // Get capacities list
  const capacitiesList = useMemo(() => {
    if (!skillAvailableCounts) return [];
    return Object.entries(CAPACITY_NAMES)
      .map(([id, name]) => ({
        id,
        name,
        available: skillAvailableCounts[id] || 0,
        wanted: skillWantedCounts?.[id] || 0,
        total: (skillAvailableCounts[id] || 0) + (skillWantedCounts?.[id] || 0),
      }))
      .sort((a, b) => b.total - a.total);
  }, [skillAvailableCounts, skillWantedCounts]);

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
      if (!capacitiesByTerritory) return [];

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
          name: CAPACITY_NAMES[id] || `Capacity ${id}`,
          available,
          wanted,
          total: available + wanted,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    },
    [capacitiesByTerritory, apiTerritoryToWikimediaMap]
  );

  // Fetch GeoJSON data
  useEffect(() => {
    d3.json(WORLD_GEOJSON_URL).then((data: any) => {
      setGeoData(data);
    });
  }, []);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = isMobile ? 350 : Math.min(500, width * 0.45);
        setDimensions({ width, height });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isMobile]);

  // Create color scale based on view mode
  const colorScale = useMemo(() => {
    let baseColor: string;

    switch (viewMode) {
      case 'languages':
        baseColor = darkMode ? '#10B85C' : '#0B8E46';
        break;
      case 'capacities':
        baseColor = darkMode ? '#B02890' : '#851D6A';
        break;
      default:
        baseColor = darkMode ? '#339ED6' : '#0070B9';
    }

    const lightColor = darkMode ? '#1A2F3A' : '#E8F4FC';

    return d3.scaleLinear<string>()
      .domain([0, maxCount])
      .range([lightColor, baseColor]);
  }, [darkMode, maxCount, viewMode]);

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
        return TERRITORY_COLORS[territory.id] || (darkMode ? '#FFFFFF' : '#333333');
      }

      const count = getTerritoryCount(territory);
      const baseColor = colorScale(count);

      if (isHovered) {
        return d3.color(baseColor)?.brighter(0.3)?.toString() || baseColor;
      }

      return baseColor;
    },
    [darkMode, selectedTerritory, hoveredTerritory, getTerritoryCount, colorScale]
  );

  // Render map structure (only when geoData, dimensions, or darkMode changes)
  useEffect(() => {
    if (!svgRef.current || !geoData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const backgroundColor = darkMode ? '#04222F' : '#FAFAFA';
    const borderColor = darkMode ? '#0A4C5A' : '#BBBBBB';

    svg
      .attr('width', width)
      .attr('height', height)
      .style('background-color', backgroundColor);

    const projection = d3
      .geoNaturalEarth1()
      .scale(isMobile ? width / 5.5 : width / 5.5)
      .translate([width / 2, height / 2]);

    const pathGenerator = d3.geoPath().projection(projection);
    const g = svg.append('g').attr('class', 'map-group');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 6])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    g.selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('class', 'country-path')
      .attr('d', pathGenerator as any)
      .attr('stroke', borderColor)
      .attr('stroke-width', 0.3)
      .style('cursor', 'pointer');
  }, [geoData, dimensions, darkMode, isMobile]);

  // Update colors separately (without re-rendering the entire map)
  useEffect(() => {
    if (!svgRef.current || !geoData) return;

    const svg = d3.select(svgRef.current);

    svg.selectAll('.country-path')
      .attr('fill', function(d: any) {
        const countryCode = d.id || d.properties?.iso_a3;
        const territory = getTerritoryByCountry(countryCode);
        return getTerritoryColor(territory);
      });
  }, [geoData, getTerritoryColor]);

  // Handle mouse events (separate effect to avoid re-binding on every render)
  useEffect(() => {
    if (!svgRef.current || !geoData) return;

    const svg = d3.select(svgRef.current);

    svg.selectAll('.country-path')
      .on('mouseover', function (event, d: any) {
        const countryCode = d.id || d.properties?.iso_a3;
        const territory = getTerritoryByCountry(countryCode);
        if (territory) {
          setHoveredTerritory(territory);
        }
      })
      .on('mouseout', function () {
        setHoveredTerritory(null);
      })
      .on('click', (event, d: any) => {
        event.stopPropagation();
        const countryCode = d.id || d.properties?.iso_a3;
        const territory = getTerritoryByCountry(countryCode);
        if (territory) {
          setSelectedTerritory(prev =>
            prev?.id === territory.id ? null : territory
          );
        }
      });
  }, [geoData]);

  // Get view mode title
  const getViewModeTitle = () => {
    switch (viewMode) {
      case 'languages':
        return pageContent['analytics-map-languages-by-territory'] || 'Languages by Territory';
      case 'capacities':
        return pageContent['analytics-map-capacities-by-territory'] || 'Capacities by Territory';
      default:
        return pageContent['analytics-map-user-density'] || 'User Density by Territory';
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
    <div ref={containerRef} className="w-full">
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
          {pageContent['analytics-map-filter-users'] || 'Users'}
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
      </div>

      {/* Map Title */}
      <div className="mb-4">
        <h3 className={`font-[Montserrat] text-lg font-bold ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}>
          {getViewModeTitle()}
        </h3>
        {viewMode === 'users' && (
          <p className={`font-[Montserrat] text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
            {pageContent['analytics-map-total-users'] || 'Total users'}: {totalUsers.toLocaleString()}
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
            <option value="all">
              {pageContent['analytics-map-all-languages'] || 'All Languages'}
            </option>
            {sortedLanguages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name} ({lang.count.toLocaleString()} {pageContent['analytics-bashboard-territory-users'] || 'users'})
              </option>
            ))}
          </select>
          {isAggregatedDataLoading && (
            <span className={`font-[Montserrat] text-xs ${darkMode ? 'text-white/50' : 'text-gray-400'}`}>
              {pageContent['analytics-map-loading-data'] || 'Loading territory data...'}
            </span>
          )}
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
            <option value="all">
              {pageContent['analytics-map-all-capacities'] || 'All Capacities'}
            </option>
            {capacitiesList.map((cap) => (
              <option key={cap.id} value={cap.id}>
                {cap.name} ({cap.total.toLocaleString()} {pageContent['analytics-bashboard-territory-users'] || 'users'})
              </option>
            ))}
          </select>
          {isAggregatedDataLoading && (
            <span className={`font-[Montserrat] text-xs ${darkMode ? 'text-white/50' : 'text-gray-400'}`}>
              {pageContent['analytics-map-loading-data'] || 'Loading territory data...'}
            </span>
          )}
        </div>
      )}

      {/* Selected item stats */}
      {viewMode === 'languages' && !isAggregatedDataLoading && (
        <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-capx-dark-bg' : 'bg-gray-50'}`}>
          <span className={`font-[Montserrat] text-lg font-bold ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}>
            {selectedLanguageId === 'all'
              ? pageContent['analytics-map-all-languages'] || 'All Languages'
              : selectedLanguage?.name}:
          </span>
          <span className={`font-[Montserrat] text-lg ml-2 text-capx-primary-green`}>
            {selectedLanguageId === 'all'
              ? sortedLanguages.reduce((sum, lang) => sum + lang.count, 0).toLocaleString()
              : selectedLanguage?.count.toLocaleString()}{' '}
            {pageContent['analytics-map-speakers'] || 'speakers'}
          </span>
        </div>
      )}

      {viewMode === 'capacities' && !isAggregatedDataLoading && (
        <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-capx-dark-bg' : 'bg-gray-50'}`}>
          <span className={`font-[Montserrat] text-lg font-bold ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}>
            {selectedCapacityId === 'all'
              ? pageContent['analytics-map-all-capacities'] || 'All Capacities'
              : selectedCapacity?.name}:
          </span>
          <span className={`font-[Montserrat] text-sm ml-2 ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
            {selectedCapacityId === 'all' ? (
              <>
                {capacitiesList.reduce((sum, cap) => sum + cap.available, 0).toLocaleString()}{' '}
                {pageContent['analytics-bashboard-capacities-card-sharers'] || 'sharers'} |{' '}
                {capacitiesList.reduce((sum, cap) => sum + cap.wanted, 0).toLocaleString()}{' '}
                {pageContent['analytics-bashboard-capacities-card-learners'] || 'learners'}
              </>
            ) : (
              <>
                {selectedCapacity?.available.toLocaleString()}{' '}
                {pageContent['analytics-bashboard-capacities-card-sharers'] || 'sharers'} |{' '}
                {selectedCapacity?.wanted.toLocaleString()}{' '}
                {pageContent['analytics-bashboard-capacities-card-learners'] || 'learners'}
              </>
            )}
          </span>
        </div>
      )}

      {/* Map */}
      <svg ref={svgRef} className="w-full rounded-lg" />

      {/* Color Scale Legend */}
      <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-capx-dark-bg' : 'bg-gray-50'}`}>
        {/* Gradient bar */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`font-[Montserrat] text-xs ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
            0
          </span>
          <div
            className="flex-1 h-4 rounded"
            style={{
              background: `linear-gradient(to right, ${gradientColors.light}, ${gradientColors.dark})`
            }}
          />
          <span className={`font-[Montserrat] text-xs ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
            {maxCount.toLocaleString()} {pageContent['analytics-bashboard-territory-users'] || 'users'}
          </span>
        </div>

        {/* Territory list with counts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {WIKIMEDIA_TERRITORIES.map((territory) => {
            const count = getTerritoryCount(territory);
            const isSelected = selectedTerritory?.id === territory.id;
            const swatchColor = isSelected
              ? TERRITORY_COLORS[territory.id] || colorScale(count)
              : colorScale(count);
            return (
              <button
                key={territory.id}
                onClick={() => setSelectedTerritory(selectedTerritory?.id === territory.id ? null : territory)}
                className={`flex items-center gap-2 p-2 rounded transition-all text-left ${
                  isSelected
                    ? darkMode
                      ? 'bg-white/20 ring-2 ring-white'
                      : 'bg-gray-200 ring-2 ring-gray-400'
                    : 'hover:opacity-80'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: swatchColor }}
                />
                <div className="flex flex-col min-w-0">
                  <span
                    className={`font-[Montserrat] text-xs truncate ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}
                    title={territory.fullName}
                  >
                    {territory.fullName}
                  </span>
                  <span
                    className={`font-[Montserrat] text-[10px] ${darkMode ? 'text-white/50' : 'text-gray-400'}`}
                  >
                    {territory.name} · {count.toLocaleString()} {pageContent['analytics-bashboard-territory-users'] || 'users'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hovered/Selected Territory Info */}
      {(hoveredTerritory || selectedTerritory) && (() => {
        const currentTerritory = (selectedTerritory || hoveredTerritory)!;
        const topLanguages = getTopLanguagesForTerritory(currentTerritory);
        const topCapacities = getTopCapacitiesForTerritory(currentTerritory);
        const isCurrentSelected = selectedTerritory?.id === currentTerritory.id;
        const infoSwatchColor = isCurrentSelected
          ? TERRITORY_COLORS[currentTerritory.id] || colorScale(getTerritoryCount(currentTerritory))
          : colorScale(getTerritoryCount(currentTerritory));

        return (
          <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-capx-dark-bg' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-6 h-6 rounded"
                style={{
                  backgroundColor: infoSwatchColor,
                }}
              />
              <h3 className={`font-[Montserrat] text-lg font-bold ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}>
                {currentTerritory.fullName}
              </h3>
            </div>
            <p className={`font-[Montserrat] text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
              {viewMode === 'languages' && selectedLanguage
                ? `${selectedLanguage.name} ${pageContent['analytics-map-speakers'] || 'speakers'}`
                : viewMode === 'capacities' && selectedCapacity
                ? `${selectedCapacity.name} ${pageContent['analytics-bashboard-territory-users'] || 'users'}`
                : pageContent['analytics-bashboard-territory-users'] || 'Users'}:{' '}
              <span className={`font-bold ${
                viewMode === 'languages'
                  ? 'text-capx-primary-green'
                  : viewMode === 'capacities'
                  ? 'text-capx-secondary-purple'
                  : 'text-capx-primary-blue'
              }`}>
                {getTerritoryCount(currentTerritory).toLocaleString()}
              </span>
            </p>
            <p className={`font-[Montserrat] text-sm ${darkMode ? 'text-white/70' : 'text-gray-600'}`}>
              {pageContent['analytics-map-countries-count'] || 'Countries in this territory'}:{' '}
              {currentTerritory.countries.length}
            </p>

            {/* Top Languages */}
            {topLanguages.length > 0 && !isAggregatedDataLoading && (
              <div className="mt-4">
                <h4 className={`font-[Montserrat] text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}>
                  {pageContent['analytics-map-top-languages'] || 'Most Spoken Languages'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {topLanguages.map((lang) => (
                    <span
                      key={lang.id}
                      className={`px-2 py-1 rounded text-xs font-[Montserrat] ${
                        darkMode ? 'bg-capx-primary-green/20 text-capx-primary-green' : 'bg-capx-primary-green/10 text-capx-primary-green'
                      }`}
                    >
                      {lang.name} ({lang.count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Top Capacities */}
            {topCapacities.length > 0 && !isAggregatedDataLoading && (
              <div className="mt-4">
                <h4 className={`font-[Montserrat] text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}`}>
                  {pageContent['analytics-map-top-capacities'] || 'Top Capacities'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {topCapacities.map((cap) => (
                    <span
                      key={cap.id}
                      className={`px-2 py-1 rounded text-xs font-[Montserrat] ${
                        darkMode ? 'bg-capx-secondary-purple/20 text-capx-secondary-purple' : 'bg-capx-secondary-purple/10 text-capx-secondary-purple'
                      }`}
                    >
                      {cap.name} ({cap.total})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isAggregatedDataLoading && (
              <p className={`font-[Montserrat] text-xs mt-4 ${darkMode ? 'text-white/50' : 'text-gray-400'}`}>
                {pageContent['analytics-map-loading-data'] || 'Loading territory data...'}
              </p>
            )}

            {selectedTerritory && (
              <p className={`font-[Montserrat] text-xs mt-4 ${darkMode ? 'text-white/50' : 'text-gray-400'}`}>
                {pageContent['analytics-map-click-deselect'] || 'Click again to deselect'}
              </p>
            )}
          </div>
        );
      })()}
    </div>
  );
}

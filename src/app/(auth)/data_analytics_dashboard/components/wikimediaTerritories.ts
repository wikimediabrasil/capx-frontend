// Wikimedia Territory Definitions
// Maps ISO 3166-1 alpha-3 country codes to Wikimedia territories

export interface WikimediaTerritory {
  id: string;
  name: string;
  fullName: string;
  color: string;
  colorDark: string;
  countries: string[]; // ISO 3166-1 alpha-3 codes
}

export const WIKIMEDIA_TERRITORIES: WikimediaTerritory[] = [
  {
    id: 'SSA',
    name: 'SSA',
    fullName: 'Sub-Saharan Africa',
    color: '#02AE8C', // capx-primary-green
    colorDark: '#03D4AA',
    countries: [
      'AGO', 'BEN', 'BWA', 'BFA', 'BDI', 'CMR', 'CPV', 'CAF', 'TCD', 'COM',
      'COG', 'COD', 'CIV', 'DJI', 'GNQ', 'ERI', 'SWZ', 'ETH', 'GAB', 'GMB',
      'GHA', 'GIN', 'GNB', 'KEN', 'LSO', 'LBR', 'MDG', 'MWI', 'MLI', 'MRT',
      'MUS', 'MOZ', 'NAM', 'NER', 'NGA', 'RWA', 'STP', 'SEN', 'SYC', 'SLE',
      'SOM', 'ZAF', 'SSD', 'SDN', 'TZA', 'TGO', 'UGA', 'ZMB', 'ZWE'
    ],
  },
  {
    id: 'NWE',
    name: 'NWE',
    fullName: 'Northern & Western Europe',
    color: '#0070B9', // capx-primary-blue
    colorDark: '#339ED6',
    countries: [
      'AND', 'AUT', 'BEL', 'DNK', 'FIN', 'FRA', 'DEU', 'GRC', 'ISL', 'IRL',
      'ITA', 'LIE', 'LUX', 'MLT', 'MCO', 'NLD', 'NOR', 'PRT', 'SMR', 'ESP',
      'SWE', 'CHE', 'GBR', 'VAT', 'CYP'
    ],
  },
  {
    id: 'ESEAP',
    name: 'ESEAP',
    fullName: 'East, Southeast Asia, & Pacific',
    color: '#851D6A', // capx-secondary-purple
    colorDark: '#B02890',
    countries: [
      'AUS', 'BRN', 'KHM', 'CHN', 'FJI', 'HKG', 'IDN', 'JPN', 'KIR', 'PRK',
      'KOR', 'LAO', 'MAC', 'MYS', 'MHL', 'FSM', 'MNG', 'MMR', 'NRU', 'NZL',
      'PLW', 'PNG', 'PHL', 'WSM', 'SGP', 'SLB', 'TWN', 'THA', 'TLS', 'TON',
      'TUV', 'VUT', 'VNM'
    ],
  },
  {
    id: 'LAC',
    name: 'LAC',
    fullName: 'Latin America & Caribbean',
    color: '#D43420', // capx-primary-red
    colorDark: '#E85A4A',
    countries: [
      'ARG', 'BHS', 'BRB', 'BLZ', 'BOL', 'BRA', 'CHL', 'COL', 'CRI', 'CUB',
      'DMA', 'DOM', 'ECU', 'SLV', 'GRD', 'GTM', 'GUY', 'HTI', 'HND', 'JAM',
      'MEX', 'NIC', 'PAN', 'PRY', 'PER', 'PRI', 'KNA', 'LCA', 'VCT', 'SUR',
      'TTO', 'URY', 'VEN'
    ],
  },
  {
    id: 'CEECA',
    name: 'CEECA',
    fullName: 'Central & Eastern Europe & Central Asia',
    color: '#F0C626', // capx-primary-yellow
    colorDark: '#F5D655',
    countries: [
      'ALB', 'ARM', 'AZE', 'BLR', 'BIH', 'BGR', 'HRV', 'CZE', 'EST', 'GEO',
      'HUN', 'KAZ', 'XKX', 'KGZ', 'LVA', 'LTU', 'MKD', 'MDA', 'MNE', 'POL',
      'ROU', 'RUS', 'SRB', 'SVK', 'SVN', 'TJK', 'TKM', 'UKR', 'UZB'
    ],
  },
  {
    id: 'SA',
    name: 'SA',
    fullName: 'South Asia',
    color: '#AE6F02', // Orange-brown
    colorDark: '#D48F20',
    countries: [
      'AFG', 'BGD', 'BTN', 'IND', 'MDV', 'NPL', 'PAK', 'LKA'
    ],
  },
  {
    id: 'MENA',
    name: 'MENA',
    fullName: 'Middle East & North Africa',
    color: '#369BDB', // Light blue
    colorDark: '#5CB3E8',
    countries: [
      'DZA', 'BHR', 'EGY', 'IRN', 'IRQ', 'ISR', 'JOR', 'KWT', 'LBN', 'LBY',
      'MAR', 'OMN', 'PSE', 'QAT', 'SAU', 'SYR', 'TUN', 'TUR', 'ARE', 'YEM'
    ],
  },
  {
    id: 'NA',
    name: 'NA',
    fullName: 'North America',
    color: '#0B8E46', // capx-secondary-green
    colorDark: '#10B85C',
    countries: [
      'CAN', 'USA'
    ],
  },
];

// Create a lookup map for quick country-to-territory mapping
export const countryToTerritoryMap: Record<string, WikimediaTerritory> = {};
WIKIMEDIA_TERRITORIES.forEach(territory => {
  territory.countries.forEach(countryCode => {
    countryToTerritoryMap[countryCode] = territory;
  });
});

// Get territory by country code
export function getTerritoryByCountry(countryCode: string): WikimediaTerritory | undefined {
  return countryToTerritoryMap[countryCode];
}

// Get territory by ID
export function getTerritoryById(territoryId: string): WikimediaTerritory | undefined {
  return WIKIMEDIA_TERRITORIES.find(t => t.id === territoryId);
}

// Get color for country (for D3 map coloring)
export function getColorForCountry(countryCode: string, darkMode: boolean): string {
  const territory = countryToTerritoryMap[countryCode];
  if (!territory) {
    return darkMode ? '#2A5366' : '#E5E5E5'; // Default gray for unmapped countries
  }
  return darkMode ? territory.colorDark : territory.color;
}

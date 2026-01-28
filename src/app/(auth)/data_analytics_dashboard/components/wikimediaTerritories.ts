// Wikimedia Territory Definitions
// Maps ISO 3166-1 alpha-3 country codes to Wikimedia territories

// ISO alpha-2 to alpha-3 mapping for SVG country codes
export const ISO_ALPHA2_TO_ALPHA3: Record<string, string> = {
  ad: 'AND', ae: 'ARE', af: 'AFG', ag: 'ATG', ai: 'AIA', al: 'ALB', am: 'ARM',
  ao: 'AGO', ar: 'ARG', as: 'ASM', at: 'AUT', au: 'AUS', aw: 'ABW', az: 'AZE',
  ba: 'BIH', bb: 'BRB', bd: 'BGD', be: 'BEL', bf: 'BFA', bg: 'BGR', bh: 'BHR',
  bi: 'BDI', bj: 'BEN', bl: 'BLM', bm: 'BMU', bn: 'BRN', bo: 'BOL', bq: 'BES',
  br: 'BRA', bs: 'BHS', bt: 'BTN', bw: 'BWA', by: 'BLR', bz: 'BLZ', ca: 'CAN',
  cc: 'CCK', cd: 'COD', cf: 'CAF', cg: 'COG', ch: 'CHE', ci: 'CIV', ck: 'COK',
  cl: 'CHL', cm: 'CMR', cn: 'CHN', co: 'COL', cr: 'CRI', cu: 'CUB', cv: 'CPV',
  cw: 'CUW', cx: 'CXR', cy: 'CYP', cz: 'CZE', de: 'DEU', dj: 'DJI', dk: 'DNK',
  dm: 'DMA', do: 'DOM', dz: 'DZA', ec: 'ECU', ee: 'EST', eg: 'EGY', eh: 'ESH',
  er: 'ERI', es: 'ESP', et: 'ETH', fi: 'FIN', fj: 'FJI', fk: 'FLK', fm: 'FSM',
  fo: 'FRO', fr: 'FRA', ga: 'GAB', gb: 'GBR', gd: 'GRD', ge: 'GEO', gf: 'GUF',
  gg: 'GGY', gh: 'GHA', gi: 'GIB', gl: 'GRL', gm: 'GMB', gn: 'GIN', gp: 'GLP',
  gq: 'GNQ', gr: 'GRC', gs: 'SGS', gt: 'GTM', gu: 'GUM', gw: 'GNB', gy: 'GUY',
  hk: 'HKG', hm: 'HMD', hn: 'HND', hr: 'HRV', ht: 'HTI', hu: 'HUN', id: 'IDN',
  ie: 'IRL', il: 'ISR', im: 'IMN', in: 'IND', io: 'IOT', iq: 'IRQ', ir: 'IRN',
  is: 'ISL', it: 'ITA', je: 'JEY', jm: 'JAM', jo: 'JOR', jp: 'JPN', ke: 'KEN',
  kg: 'KGZ', kh: 'KHM', ki: 'KIR', km: 'COM', kn: 'KNA', kp: 'PRK', kr: 'KOR',
  kw: 'KWT', ky: 'CYM', kz: 'KAZ', la: 'LAO', lb: 'LBN', lc: 'LCA', li: 'LIE',
  lk: 'LKA', lr: 'LBR', ls: 'LSO', lt: 'LTU', lu: 'LUX', lv: 'LVA', ly: 'LBY',
  ma: 'MAR', mc: 'MCO', md: 'MDA', me: 'MNE', mf: 'MAF', mg: 'MDG', mh: 'MHL',
  mk: 'MKD', ml: 'MLI', mm: 'MMR', mn: 'MNG', mo: 'MAC', mp: 'MNP', mq: 'MTQ',
  mr: 'MRT', ms: 'MSR', mt: 'MLT', mu: 'MUS', mv: 'MDV', mw: 'MWI', mx: 'MEX',
  my: 'MYS', mz: 'MOZ', na: 'NAM', nc: 'NCL', ne: 'NER', nf: 'NFK', ng: 'NGA',
  ni: 'NIC', nl: 'NLD', no: 'NOR', np: 'NPL', nr: 'NRU', nu: 'NIU', nz: 'NZL',
  om: 'OMN', pa: 'PAN', pe: 'PER', pf: 'PYF', pg: 'PNG', ph: 'PHL', pk: 'PAK',
  pl: 'POL', pm: 'SPM', pn: 'PCN', pr: 'PRI', ps: 'PSE', pt: 'PRT', pw: 'PLW',
  py: 'PRY', qa: 'QAT', re: 'REU', ro: 'ROU', rs: 'SRB', ru: 'RUS', rw: 'RWA',
  sa: 'SAU', sb: 'SLB', sc: 'SYC', sd: 'SDN', se: 'SWE', sg: 'SGP', sh: 'SHN',
  si: 'SVN', sk: 'SVK', sl: 'SLE', sm: 'SMR', sn: 'SEN', so: 'SOM', sr: 'SUR',
  ss: 'SSD', st: 'STP', sv: 'SLV', sx: 'SXM', sy: 'SYR', sz: 'SWZ', tc: 'TCA',
  td: 'TCD', tf: 'ATF', tg: 'TGO', th: 'THA', tj: 'TJK', tk: 'TKL', tl: 'TLS',
  tm: 'TKM', tn: 'TUN', to: 'TON', tr: 'TUR', tt: 'TTO', tv: 'TUV', tw: 'TWN',
  tz: 'TZA', ua: 'UKR', ug: 'UGA', us: 'USA', uy: 'URY', uz: 'UZB', va: 'VAT',
  vc: 'VCT', ve: 'VEN', vg: 'VGB', vi: 'VIR', vn: 'VNM', vu: 'VUT', wf: 'WLF',
  ws: 'WSM', xk: 'XKX', ye: 'YEM', yt: 'MYT', za: 'ZAF', zm: 'ZMB', zw: 'ZWE',
};

// Get alpha-3 code from alpha-2 code
export function getAlpha3FromAlpha2(alpha2: string): string | undefined {
  return ISO_ALPHA2_TO_ALPHA3[alpha2.toLowerCase()];
}

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
      'AGO', 'ATF', 'BDI', 'BEN', 'BFA', 'BWA', 'CAF', 'CMR', 'COD', 'COG',
      'COM', 'CPV', 'CIV', 'DJI', 'ERI', 'ETH', 'GAB', 'GHA', 'GIN', 'GMB',
      'GNB', 'GNQ', 'IOT', 'KEN', 'LBR', 'LSO', 'MDG', 'MLI', 'MRT', 'MUS',
      'MWI', 'MYT', 'MOZ', 'NAM', 'NER', 'NGA', 'REU', 'RWA', 'SDN', 'SEN',
      'SHN', 'SLE', 'SOM', 'SSD', 'STP', 'SWZ', 'SYC', 'TCD', 'TGO', 'TZA',
      'UGA', 'ZAF', 'ZMB', 'ZWE'
    ],
  },
  {
    id: 'NWE',
    name: 'NWE',
    fullName: 'Northern & Western Europe',
    color: '#0070B9', // capx-primary-blue
    colorDark: '#339ED6',
    countries: [
      'AND', 'AUT', 'BEL', 'CHE', 'CYP', 'DEU', 'DNK', 'ESP', 'FIN', 'FRA',
      'FRO', 'GBR', 'GGY', 'GIB', 'GRC', 'GRL', 'IMN', 'IRL', 'ISL', 'ITA',
      'JEY', 'LIE', 'LUX', 'MCO', 'MLT', 'NLD', 'NOR', 'PRT', 'SMR', 'SWE',
      'VAT'
    ],
  },
  {
    id: 'ESEAP',
    name: 'ESEAP',
    fullName: 'East, Southeast Asia, & Pacific',
    color: '#851D6A', // capx-secondary-purple
    colorDark: '#B02890',
    countries: [
      'AUS', 'ASM', 'BRN', 'CCK', 'COK', 'CXR', 'FJI', 'FSM', 'GUM', 'HKG',
      'IDN', 'JPN', 'KHM', 'KIR', 'KOR', 'LAO', 'MAC', 'MHL', 'MNG', 'MMR',
      'MNP', 'MYS', 'NCL', 'NFK', 'NIU', 'NRU', 'NZL', 'PCN', 'PHL', 'PLW',
      'PNG', 'PRK', 'PYF', 'SGP', 'SLB', 'THA', 'TKL', 'TLS', 'TON', 'TUV',
      'TWN', 'VNM', 'VUT', 'WLF', 'WSM', 'CHN'
    ],
  },
  {
    id: 'LAC',
    name: 'LAC',
    fullName: 'Latin America & Caribbean',
    color: '#D43420', // capx-primary-red
    colorDark: '#E85A4A',
    countries: [
      'ABW', 'AIA', 'ARG', 'ATG', 'BES', 'BHS', 'BLM', 'BLZ', 'BMU', 'BOL',
      'BRB', 'BRA', 'CHL', 'COL', 'CRI', 'CUB', 'CUW', 'CYM', 'DMA', 'DOM',
      'ECU', 'FLK', 'GLP', 'GRD', 'GTM', 'GUF', 'GUY', 'HND', 'HTI', 'JAM',
      'KNA', 'LCA', 'MAF', 'MEX', 'MSR', 'MTQ', 'NIC', 'PAN', 'PER', 'PRI',
      'PRY', 'SLV', 'SPM', 'SUR', 'SXM', 'TCA', 'TTO', 'URY', 'VCT', 'VEN',
      'VGB', 'VIR'
    ],
  },
  {
    id: 'CEECA',
    name: 'CEECA',
    fullName: 'Central & Eastern Europe & Central Asia',
    color: '#F0C626', // capx-primary-yellow
    colorDark: '#F5D655',
    countries: [
      'ALB', 'ARM', 'AZE', 'BIH', 'BGR', 'BLR', 'CZE', 'EST', 'GEO', 'HRV',
      'HUN', 'KAZ', 'KGZ', 'LTU', 'LVA', 'MDA', 'MKD', 'MNE', 'POL', 'ROU',
      'RUS', 'SRB', 'SVK', 'SVN', 'TJK', 'TKM', 'UKR', 'UZB', 'XKX'
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
      'ARE', 'BHR', 'DZA', 'EGY', 'ESH', 'IRN', 'IRQ', 'ISR', 'JOR', 'KWT',
      'LBN', 'LBY', 'MAR', 'OMN', 'PSE', 'QAT', 'SAU', 'SYR', 'TUN', 'TUR',
      'YEM'
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

// Get territory by country code (supports both alpha-2 and alpha-3)
export function getTerritoryByCountry(countryCode: string): WikimediaTerritory | undefined {
  // Try direct lookup (alpha-3)
  if (countryToTerritoryMap[countryCode]) {
    return countryToTerritoryMap[countryCode];
  }
  // Try converting alpha-2 to alpha-3
  const alpha3 = getAlpha3FromAlpha2(countryCode);
  if (alpha3) {
    return countryToTerritoryMap[alpha3];
  }
  return undefined;
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

// Fallback mapping of known API territory IDs to Wikimedia territory IDs
// Based on actual API data: IDs 18-25 are the Wikimedia regions
export const API_TERRITORY_ID_TO_WIKIMEDIA: Record<string, string> = {
  '18': 'MENA',   // Middle East & North Africa (MENA)
  '19': 'SSA',    // Sub-Saharan Africa (SSA)
  '20': 'SA',     // South Asia (SA)
  '21': 'ESEAP',  // East, Southeast Asia, & Pacific (ESEAP)
  '22': 'LAC',    // Latin America & Caribbean (LAC)
  '23': 'NA',     // North America (NA)
  '24': 'NWE',    // Northern & Western Europe (NWE)
  '25': 'CEECA',  // Central & Eastern Europe & Central Asia (CEECA)
};

// Build mapping from API territory to Wikimedia territory using either dynamic names or fallback
export function buildApiTerritoryToWikimediaMap(
  territories: Record<string, string> | null | undefined
): Record<string, string> {
  const map: Record<string, string> = {};

  // If territories is available, use dynamic mapping based on names
  if (territories && Object.keys(territories).length > 0) {
    // Map that handles various naming patterns including parenthetical abbreviations
    // e.g., "Middle East & North Africa (MENA)" or "Sub-Saharan Africa (SSA)"
    const NORMALIZED_TERRITORY_MAP: Record<string, string> = {
      // Full names without abbreviations
      subsaharanafrica: 'SSA',
      northernandwesterneurope: 'NWE',
      eastsoutheastasiaandpacific: 'ESEAP',
      latinamericaandcaribbean: 'LAC',
      centralandeasterneuropeandcentralasia: 'CEECA',
      southasia: 'SA',
      middleeastandnorthafrica: 'MENA',
      northamerica: 'NA',
      // With abbreviations in parentheses (normalized)
      subsaharanafricassa: 'SSA',
      northernandwesterneuropenwe: 'NWE',
      eastsoutheastasiaandpacificeseap: 'ESEAP',
      latinamericaandcaribbeanlac: 'LAC',
      centralandeasterneuropeandcentralasiaceeca: 'CEECA',
      southasiasa: 'SA',
      middleeastandnorthafricamena: 'MENA',
      northamericana: 'NA',
      // Just abbreviations
      ssa: 'SSA',
      nwe: 'NWE',
      eseap: 'ESEAP',
      lac: 'LAC',
      ceeca: 'CEECA',
      sa: 'SA',
      mena: 'MENA',
      na: 'NA',
    };

    Object.entries(territories).forEach(([id, name]) => {
      const normalizedName = name
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]/g, '')
        .trim();
      const wikimediaId = NORMALIZED_TERRITORY_MAP[normalizedName];
      if (wikimediaId) {
        map[id] = wikimediaId;
      }
    });

    // If we found mappings, return them
    if (Object.keys(map).length > 0) {
      return map;
    }
  }

  // Fallback to hardcoded mapping when territories data is not available or no matches found
  return { ...API_TERRITORY_ID_TO_WIKIMEDIA };
}

// Mock SVG imports before any module is loaded
jest.mock('@/public/static/images/cheer.svg', () => 'cheer.svg');
jest.mock('@/public/static/images/chess_pawn.svg', () => 'chess_pawn.svg');
jest.mock('@/public/static/images/communication.svg', () => 'communication.svg');
jest.mock('@/public/static/images/communities.svg', () => 'communities.svg');
jest.mock('@/public/static/images/corporate_fare.svg', () => 'corporate_fare.svg');
jest.mock('@/public/static/images/local_library.svg', () => 'local_library.svg');
jest.mock('@/public/static/images/wifi_tethering.svg', () => 'wifi_tethering.svg');

import {
  isInvalidCapacityLabel,
  getHueRotate,
  getCapacityColor,
  getCapacityIcon,
  sanitizeCapacityName,
  addUniqueCapacities,
  ensureArray,
  sanitizeCapacityCode,
} from '@/lib/utils/capacitiesUtils';

// ---------------------------------------------------------------------------
// isInvalidCapacityLabel
// ---------------------------------------------------------------------------
describe('isInvalidCapacityLabel', () => {
  it.each([
    [undefined, true],
    ['', true],
    ['   ', true],
    ['https://www.wikidata.org/entity/Q12345', true],
    ['https://example.com/label', true],
    ['wikidata entity/Q123', true],
    ['some entity/identifier', true],
    ['Q12345', true],
    ['Q1', true],
    ['q9999', true],
    ['Communication', false],
    ['Strategic Planning', false],
    ['Wiki editing', false],
    ['Quality Assurance', false],
    ['Querying Data', false],
    ['  Community Building  ', false],
  ])('returns %p for %p', (input, expected) => {
    expect(isInvalidCapacityLabel(input)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// getHueRotate
// ---------------------------------------------------------------------------
describe('getHueRotate', () => {
  it.each([undefined, ''])('returns empty string for %p', input => {
    expect(getHueRotate(input)).toBe('');
  });

  it('returns a CSS filter string containing hue-rotate for known hex', () => {
    const filter = getHueRotate('#0078D4');
    expect(filter).toContain('hue-rotate');
  });

  it.each(['#0078D4', '#BE0078', '#00965A', '#8E44AD', '#D35400', '#3498DB', '#27AE60'])(
    'returns non-empty filter for hex %s',
    hex => {
      expect(getHueRotate(hex).length).toBeGreaterThan(0);
    }
  );

  it.each([
    'organizational',
    'communication',
    'learning',
    'community',
    'social',
    'strategic',
    'technology',
  ])('returns non-empty filter for category %s', cat => {
    expect(getHueRotate(cat).length).toBeGreaterThan(0);
  });

  it('returns empty string for unknown category name', () => {
    expect(getHueRotate('unknown-category')).toBe('');
  });

  it('returns falsy for unknown hex colour', () => {
    expect(getHueRotate('#FFFFFF')).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
// getCapacityColor
// ---------------------------------------------------------------------------
describe('getCapacityColor', () => {
  it.each([
    ['organizational', '#0078D4'],
    ['communication', '#BE0078'],
    ['learning', '#00965A'],
    ['community', '#8E44AD'],
    ['social', '#D35400'],
    ['strategic', '#3498DB'],
    ['technology', '#27AE60'],
    ['#FF0000', '#FF0000'],
    ['', '#000000'],
    ['unknown', 'unknown'],
  ])('returns %p for %p', (input, expected) => {
    expect(getCapacityColor(input)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// getCapacityIcon
// ---------------------------------------------------------------------------
describe('getCapacityIcon', () => {
  it('returns a string for any code', () => {
    expect(typeof getCapacityIcon(10)).toBe('string');
    expect(typeof getCapacityIcon(36)).toBe('string');
    expect(typeof getCapacityIcon(50)).toBe('string');
    expect(typeof getCapacityIcon(106)).toBe('string');
    expect(typeof getCapacityIcon(999)).toBe('string');
  });

  it('returns same icon for codes in same category', () => {
    // 10 and 101 both start with '10' (not '106')
    expect(getCapacityIcon(10)).toBe(getCapacityIcon(101));
    expect(getCapacityIcon(36)).toBe(getCapacityIcon(365));
  });

  it('returns a default icon for unrecognised codes', () => {
    // 999 and 0 should both get the default (the organizational icon)
    expect(getCapacityIcon(999)).toBe(getCapacityIcon(0));
  });

  it('returns the default icon for code 0', () => {
    // Default fallback is the organizational icon (same as code 10)
    expect(getCapacityIcon(0)).toBe(getCapacityIcon(10));
  });
});

// ---------------------------------------------------------------------------
// sanitizeCapacityName
// ---------------------------------------------------------------------------
describe('sanitizeCapacityName', () => {
  it.each([
    [undefined, 42, 'Capacity 42'],
    ['', 10, 'Capacity 10'],
    ['   ', 7, 'Capacity 7'],
    ['https://wikidata.org/entity/Q1', 99, 'Capacity 99'],
    ['entity/Q999', 55, 'Capacity 55'],
    ['Q12345', 33, 'Capacity 33'],
    ['  Communication  ', 36, 'Communication'],
    ['Strategic Planning', 74, 'Strategic Planning'],
    [undefined, 'Q99', 'Capacity Q99'],
  ])('sanitizeCapacityName(%p, %p) => %p', (name, code, expected) => {
    expect(sanitizeCapacityName(name, code)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// addUniqueCapacities  (the {code, name} object version from capacitiesUtils)
// ---------------------------------------------------------------------------
describe('addUniqueCapacities (CapacityItem version)', () => {
  it('adds new capacities to an empty array', () => {
    const result = addUniqueCapacities([], [{ code: 1, name: 'A' } as any]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ code: 1, name: 'A' });
  });

  it('adds only new capacities, skipping duplicates by code', () => {
    const existing = [{ code: 1, name: 'A' }];
    const newCaps = [
      { code: 1, name: 'A Updated' },
      { code: 2, name: 'B' },
    ] as any[];
    const result = addUniqueCapacities(existing, newCaps);
    expect(result).toHaveLength(2);
    // Existing entry should remain unchanged
    expect(result[0].name).toBe('A');
    expect(result[1]).toEqual({ code: 2, name: 'B' });
  });

  it('returns existing array unchanged when no new items are unique', () => {
    const existing = [
      { code: 1, name: 'A' },
      { code: 2, name: 'B' },
    ];
    const result = addUniqueCapacities(existing, [
      { code: 1, name: 'A' },
      { code: 2, name: 'B' },
    ] as any[]);
    expect(result).toHaveLength(2);
  });

  it('handles empty newCapacities', () => {
    const existing = [{ code: 1, name: 'A' }];
    const result = addUniqueCapacities(existing, []);
    expect(result).toEqual(existing);
  });

  it('handles both arrays empty', () => {
    expect(addUniqueCapacities([], [])).toEqual([]);
  });

  it('adds multiple new unique capacities at once', () => {
    const result = addUniqueCapacities([{ code: 1, name: 'A' }], [
      { code: 2, name: 'B' },
      { code: 3, name: 'C' },
    ] as any[]);
    expect(result).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// ensureArray
// ---------------------------------------------------------------------------
describe('ensureArray', () => {
  it('returns the array unchanged when given an array', () => {
    const arr = [1, 2, 3];
    expect(ensureArray(arr)).toBe(arr);
  });

  it.each([undefined, null, 'string', 42, {}, []])('returns empty array for %p', input => {
    expect(ensureArray(input)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// sanitizeCapacityCode
// ---------------------------------------------------------------------------
describe('sanitizeCapacityCode', () => {
  it.each([
    ['42', 42],
    ['10', 10],
    [99, 99],
    [0, 0],
    ['0', 0],
    ['123abc', 123],
  ])('sanitizeCapacityCode(%p) => %p', (input, expected) => {
    expect(sanitizeCapacityCode(input)).toBe(expected);
  });

  it('returns NaN for a non-numeric string', () => {
    expect(sanitizeCapacityCode('abc')).toBeNaN();
  });
});

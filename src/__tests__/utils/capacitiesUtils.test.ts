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
  it('returns true for undefined', () => {
    expect(isInvalidCapacityLabel(undefined)).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isInvalidCapacityLabel('')).toBe(true);
  });

  it('returns true for whitespace-only string', () => {
    expect(isInvalidCapacityLabel('   ')).toBe(true);
  });

  it('returns true for strings starting with http', () => {
    expect(isInvalidCapacityLabel('http://www.wikidata.org/entity/Q12345')).toBe(true);
    expect(isInvalidCapacityLabel('https://example.com/label')).toBe(true);
  });

  it('returns true for strings containing "entity/"', () => {
    expect(isInvalidCapacityLabel('wikidata entity/Q123')).toBe(true);
    expect(isInvalidCapacityLabel('some entity/identifier')).toBe(true);
  });

  it('returns true for QID-matching strings (Q followed by digits)', () => {
    expect(isInvalidCapacityLabel('Q12345')).toBe(true);
    expect(isInvalidCapacityLabel('Q1')).toBe(true);
    expect(isInvalidCapacityLabel('q9999')).toBe(true); // case-insensitive flag i
  });

  it('returns false for a normal human-readable label', () => {
    expect(isInvalidCapacityLabel('Communication')).toBe(false);
    expect(isInvalidCapacityLabel('Strategic Planning')).toBe(false);
    expect(isInvalidCapacityLabel('Wiki editing')).toBe(false);
  });

  it('returns false for a label that starts with Q but has non-digit characters', () => {
    expect(isInvalidCapacityLabel('Quality Assurance')).toBe(false);
    expect(isInvalidCapacityLabel('Querying Data')).toBe(false);
  });

  it('returns false for a label with leading/trailing spaces but valid content', () => {
    expect(isInvalidCapacityLabel('  Community Building  ')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getHueRotate
// ---------------------------------------------------------------------------
describe('getHueRotate', () => {
  it('returns empty string for undefined', () => {
    expect(getHueRotate(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(getHueRotate('')).toBe('');
  });

  it('returns a CSS filter string for known hex colours', () => {
    // organisational blue
    const filter = getHueRotate('#0078D4');
    expect(typeof filter).toBe('string');
    expect(filter.length).toBeGreaterThan(0);
    expect(filter).toContain('hue-rotate');
  });

  it('returns a CSS filter string for each known hex colour', () => {
    const hexColors = ['#0078D4', '#BE0078', '#00965A', '#8E44AD', '#D35400', '#3498DB', '#27AE60'];
    hexColors.forEach(hex => {
      const result = getHueRotate(hex);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  it('returns a filter string for known category names', () => {
    const categories = [
      'organizational',
      'communication',
      'learning',
      'community',
      'social',
      'strategic',
      'technology',
    ];
    categories.forEach(cat => {
      const result = getHueRotate(cat);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
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
  it('returns hex for "organizational"', () => {
    expect(getCapacityColor('organizational')).toBe('#0078D4');
  });

  it('returns hex for "communication"', () => {
    expect(getCapacityColor('communication')).toBe('#BE0078');
  });

  it('returns hex for "learning"', () => {
    expect(getCapacityColor('learning')).toBe('#00965A');
  });

  it('returns hex for "community"', () => {
    expect(getCapacityColor('community')).toBe('#8E44AD');
  });

  it('returns hex for "social"', () => {
    expect(getCapacityColor('social')).toBe('#D35400');
  });

  it('returns hex for "strategic"', () => {
    expect(getCapacityColor('strategic')).toBe('#3498DB');
  });

  it('returns hex for "technology"', () => {
    expect(getCapacityColor('technology')).toBe('#27AE60');
  });

  it('passes through an explicit hex colour unchanged', () => {
    expect(getCapacityColor('#FF0000')).toBe('#FF0000');
  });

  it('returns #000000 for empty string', () => {
    expect(getCapacityColor('')).toBe('#000000');
  });

  it('passes through an unknown string', () => {
    expect(getCapacityColor('unknown')).toBe('unknown');
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
  it('returns "Capacity {code}" for undefined name', () => {
    expect(sanitizeCapacityName(undefined, 42)).toBe('Capacity 42');
  });

  it('returns "Capacity {code}" for empty string name', () => {
    expect(sanitizeCapacityName('', 10)).toBe('Capacity 10');
  });

  it('returns "Capacity {code}" for whitespace-only name', () => {
    expect(sanitizeCapacityName('   ', 7)).toBe('Capacity 7');
  });

  it('returns "Capacity {code}" for http-prefixed name', () => {
    expect(sanitizeCapacityName('http://wikidata.org/entity/Q1', 99)).toBe('Capacity 99');
  });

  it('returns "Capacity {code}" for entity/-containing name', () => {
    expect(sanitizeCapacityName('entity/Q999', 55)).toBe('Capacity 55');
  });

  it('returns "Capacity {code}" for QID name', () => {
    expect(sanitizeCapacityName('Q12345', 33)).toBe('Capacity 33');
  });

  it('returns trimmed name for a valid label', () => {
    expect(sanitizeCapacityName('  Communication  ', 36)).toBe('Communication');
  });

  it('returns the name as-is (trimmed) for normal input', () => {
    expect(sanitizeCapacityName('Strategic Planning', 74)).toBe('Strategic Planning');
  });

  it('works with string code', () => {
    expect(sanitizeCapacityName(undefined, 'Q99')).toBe('Capacity Q99');
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
    const existing = [{ code: 1, name: 'A' }, { code: 2, name: 'B' }];
    const result = addUniqueCapacities(existing, [{ code: 1, name: 'A' }, { code: 2, name: 'B' }] as any[]);
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
    const result = addUniqueCapacities(
      [{ code: 1, name: 'A' }],
      [{ code: 2, name: 'B' }, { code: 3, name: 'C' }] as any[]
    );
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

  it('returns empty array for undefined', () => {
    expect(ensureArray(undefined)).toEqual([]);
  });

  it('returns empty array for null', () => {
    expect(ensureArray(null as any)).toEqual([]);
  });

  it('returns empty array for a non-array value', () => {
    expect(ensureArray('string' as any)).toEqual([]);
    expect(ensureArray(42 as any)).toEqual([]);
    expect(ensureArray({} as any)).toEqual([]);
  });

  it('returns empty array for an empty array', () => {
    expect(ensureArray([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// sanitizeCapacityCode
// ---------------------------------------------------------------------------
describe('sanitizeCapacityCode', () => {
  it('parses a string to a number', () => {
    expect(sanitizeCapacityCode('42')).toBe(42);
    expect(sanitizeCapacityCode('10')).toBe(10);
  });

  it('returns the number unchanged when already a number', () => {
    expect(sanitizeCapacityCode(99)).toBe(99);
    expect(sanitizeCapacityCode(0)).toBe(0);
  });

  it('returns NaN for a non-numeric string', () => {
    expect(sanitizeCapacityCode('abc')).toBeNaN();
  });

  it('parses the leading numeric part of a mixed string', () => {
    // parseInt('123abc') === 123
    expect(sanitizeCapacityCode('123abc')).toBe(123);
  });

  it('handles string "0"', () => {
    expect(sanitizeCapacityCode('0')).toBe(0);
  });
});

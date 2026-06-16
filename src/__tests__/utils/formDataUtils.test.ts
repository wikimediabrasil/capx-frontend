import {
  addUniqueItem,
  addUniqueItems,
  addUniqueCapacity,
  addUniqueCapacities,
  addUniqueLanguage,
  addUniqueLanguages,
  addUniqueAffiliation,
  addUniqueAffiliations,
  addUniqueTerritory,
  addUniqueProject,
  addUniqueProjects,
  addLanguageToFormData,
  addAffiliationToFormData,
  addTerritoryToFormData,
  addProjectToFormData,
} from '@/lib/utils/formDataUtils';
import { LanguageProficiency } from '@/types/language';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const lang = (id: number, proficiency = '3', name = `Lang ${id}`): LanguageProficiency => ({
  id,
  proficiency,
  name,
});

// ---------------------------------------------------------------------------
// addUniqueItem
// ---------------------------------------------------------------------------
describe('addUniqueItem', () => {
  it('adds item when not present', () => {
    expect(addUniqueItem([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it('returns same array when item already present', () => {
    const arr = [1, 2, 3];
    const result = addUniqueItem(arr, 2);
    expect(result).toEqual([1, 2, 3]);
    expect(result).toBe(arr); // no copy made
  });

  it('works with strings', () => {
    expect(addUniqueItem(['a', 'b'], 'c')).toEqual(['a', 'b', 'c']);
    expect(addUniqueItem(['a', 'b'], 'a')).toEqual(['a', 'b']);
  });

  it('works with an empty array', () => {
    expect(addUniqueItem([], 'x')).toEqual(['x']);
  });
});

// ---------------------------------------------------------------------------
// addUniqueItems
// ---------------------------------------------------------------------------
describe('addUniqueItems', () => {
  it('adds all new items', () => {
    expect(addUniqueItems([1], [2, 3])).toEqual([1, 2, 3]);
  });

  it('skips items already in the array', () => {
    expect(addUniqueItems([1, 2], [2, 3])).toEqual([1, 2, 3]);
  });

  it('handles empty new items', () => {
    expect(addUniqueItems([1, 2], [])).toEqual([1, 2]);
  });

  it('handles empty existing array', () => {
    expect(addUniqueItems([], [1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('handles fully overlapping arrays', () => {
    expect(addUniqueItems([1, 2, 3], [1, 2, 3])).toEqual([1, 2, 3]);
  });
});

// ---------------------------------------------------------------------------
// addUniqueCapacity
// ---------------------------------------------------------------------------
describe('addUniqueCapacity', () => {
  it('adds capacity when not present', () => {
    expect(addUniqueCapacity([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it('does not add capacity when already present', () => {
    expect(addUniqueCapacity([1, 2, 3], 2)).toEqual([1, 2, 3]);
  });

  it('works with an empty array', () => {
    expect(addUniqueCapacity([], 42)).toEqual([42]);
  });

  it('uses normalized string comparison (number vs same number)', () => {
    // Capacity IDs are always numbers, but normalizeId converts to string for comparison
    expect(addUniqueCapacity([10], 10)).toEqual([10]);
  });
});

// ---------------------------------------------------------------------------
// addUniqueCapacities
// ---------------------------------------------------------------------------
describe('addUniqueCapacities', () => {
  it('adds multiple new capacities', () => {
    expect(addUniqueCapacities([1], [2, 3])).toEqual([1, 2, 3]);
  });

  it('skips duplicate capacities', () => {
    expect(addUniqueCapacities([1, 2], [2, 3, 4])).toEqual([1, 2, 3, 4]);
  });

  it('handles empty inputs', () => {
    expect(addUniqueCapacities([], [])).toEqual([]);
    expect(addUniqueCapacities([5], [])).toEqual([5]);
    expect(addUniqueCapacities([], [5])).toEqual([5]);
  });

  it('handles fully overlapping sets', () => {
    expect(addUniqueCapacities([1, 2, 3], [1, 2, 3])).toEqual([1, 2, 3]);
  });
});

// ---------------------------------------------------------------------------
// addUniqueLanguage
// ---------------------------------------------------------------------------
describe('addUniqueLanguage', () => {
  it('adds language when id not present', () => {
    const result = addUniqueLanguage([lang(1)], lang(2));
    expect(result).toHaveLength(2);
    expect(result[1].id).toBe(2);
  });

  it('does not add when language id already exists', () => {
    const existing = [lang(1, '3', 'English')];
    const result = addUniqueLanguage(existing, lang(1, '5', 'English Updated'));
    expect(result).toHaveLength(1);
    expect(result[0].proficiency).toBe('3'); // original unchanged
  });

  it('works with an empty array', () => {
    expect(addUniqueLanguage([], lang(99))).toHaveLength(1);
  });

  it('uses normalized id comparison (same numeric id)', () => {
    const result = addUniqueLanguage([lang(5)], lang(5));
    expect(result).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// addUniqueLanguages
// ---------------------------------------------------------------------------
describe('addUniqueLanguages', () => {
  it('adds all new languages', () => {
    const result = addUniqueLanguages([lang(1)], [lang(2), lang(3)]);
    expect(result).toHaveLength(3);
  });

  it('skips languages with duplicate ids', () => {
    const result = addUniqueLanguages([lang(1), lang(2)], [lang(2), lang(3)]);
    expect(result).toHaveLength(3);
    expect(result.map(l => l.id)).toEqual([1, 2, 3]);
  });

  it('handles empty arrays', () => {
    expect(addUniqueLanguages([], [])).toEqual([]);
    expect(addUniqueLanguages([lang(1)], [])).toHaveLength(1);
    expect(addUniqueLanguages([], [lang(1)])).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// addUniqueAffiliation
// ---------------------------------------------------------------------------
describe('addUniqueAffiliation', () => {
  it('adds affiliation when not present', () => {
    expect(addUniqueAffiliation(['org-1'], 'org-2')).toEqual(['org-1', 'org-2']);
  });

  it('does not add when already present', () => {
    expect(addUniqueAffiliation(['org-1', 'org-2'], 'org-1')).toEqual(['org-1', 'org-2']);
  });

  it('works with empty array', () => {
    expect(addUniqueAffiliation([], 'org-1')).toEqual(['org-1']);
  });
});

// ---------------------------------------------------------------------------
// addUniqueAffiliations
// ---------------------------------------------------------------------------
describe('addUniqueAffiliations', () => {
  it('adds all new affiliations', () => {
    expect(addUniqueAffiliations(['a'], ['b', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('skips duplicates using normalized comparison', () => {
    expect(addUniqueAffiliations(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c']);
  });

  it('handles empty inputs', () => {
    expect(addUniqueAffiliations([], [])).toEqual([]);
    expect(addUniqueAffiliations(['a'], [])).toEqual(['a']);
    expect(addUniqueAffiliations([], ['a'])).toEqual(['a']);
  });

  it('handles fully overlapping sets', () => {
    expect(addUniqueAffiliations(['a', 'b'], ['a', 'b'])).toEqual(['a', 'b']);
  });
});

// ---------------------------------------------------------------------------
// addUniqueTerritory
// ---------------------------------------------------------------------------
describe('addUniqueTerritory', () => {
  it('adds territory when not present', () => {
    expect(addUniqueTerritory(['SSA'], 'MENA')).toEqual(['SSA', 'MENA']);
  });

  it('does not add when already present', () => {
    expect(addUniqueTerritory(['SSA', 'MENA'], 'SSA')).toEqual(['SSA', 'MENA']);
  });

  it('returns array unchanged when territoryId is empty string', () => {
    expect(addUniqueTerritory(['SSA'], '')).toEqual(['SSA']);
  });

  it('returns array unchanged when territoryId is falsy (undefined-like empty)', () => {
    // The function guards against empty / falsy values
    expect(addUniqueTerritory([], '')).toEqual([]);
  });

  it('works with empty array', () => {
    expect(addUniqueTerritory([], 'NWE')).toEqual(['NWE']);
  });
});

// ---------------------------------------------------------------------------
// addUniqueProject / addUniqueProjects
// ---------------------------------------------------------------------------
describe('addUniqueProject', () => {
  it('delegates to addUniqueItem - adds new project', () => {
    expect(addUniqueProject(['wp', 'wk'], 'wq')).toEqual(['wp', 'wk', 'wq']);
  });

  it('delegates to addUniqueItem - skips existing project', () => {
    expect(addUniqueProject(['wp', 'wk'], 'wp')).toEqual(['wp', 'wk']);
  });

  it('works with empty array', () => {
    expect(addUniqueProject([], 'wp')).toEqual(['wp']);
  });
});

describe('addUniqueProjects', () => {
  it('delegates to addUniqueItems - adds new projects', () => {
    expect(addUniqueProjects(['wp'], ['wk', 'wq'])).toEqual(['wp', 'wk', 'wq']);
  });

  it('delegates to addUniqueItems - skips existing projects', () => {
    expect(addUniqueProjects(['wp', 'wk'], ['wk', 'wq'])).toEqual(['wp', 'wk', 'wq']);
  });

  it('handles empty inputs', () => {
    expect(addUniqueProjects([], [])).toEqual([]);
    expect(addUniqueProjects(['wp'], [])).toEqual(['wp']);
    expect(addUniqueProjects([], ['wp'])).toEqual(['wp']);
  });
});

// ---------------------------------------------------------------------------
// addLanguageToFormData
// ---------------------------------------------------------------------------
describe('addLanguageToFormData', () => {
  it('adds language to formData.language', () => {
    const formData = { language: [] };
    const result = addLanguageToFormData(formData, 1, '3', 'English');
    expect(result.language).toHaveLength(1);
    expect(result.language[0]).toEqual({ id: 1, proficiency: '3', name: 'English' });
  });

  it('uses default proficiency "3" when not provided', () => {
    const result = addLanguageToFormData({}, 7);
    expect(result.language[0].proficiency).toBe('3');
  });

  it('uses fallback name when languageName not provided', () => {
    const result = addLanguageToFormData({}, 42);
    expect(result.language[0].name).toBe('Language 42');
  });

  it('does not add duplicate language (same id)', () => {
    const formData = { language: [{ id: 1, proficiency: '3', name: 'English' }] };
    const result = addLanguageToFormData(formData, 1, '5', 'English Updated');
    expect(result.language).toHaveLength(1);
    expect(result.language[0].proficiency).toBe('3'); // original kept
  });

  it('returns same formData reference when language already exists', () => {
    const formData = { language: [{ id: 1, proficiency: '3', name: 'English' }] };
    const result = addLanguageToFormData(formData, 1);
    expect(result).toBe(formData);
  });

  it('initialises formData.language when missing', () => {
    const formData = { name: 'test' };
    const result = addLanguageToFormData(formData, 5, '2', 'French');
    expect(result.language).toHaveLength(1);
    expect(result.name).toBe('test'); // other fields preserved
  });

  it('preserves other formData fields', () => {
    const formData = { language: [], country: 'BR' };
    const result = addLanguageToFormData(formData, 1);
    expect(result.country).toBe('BR');
  });
});

// ---------------------------------------------------------------------------
// addAffiliationToFormData
// ---------------------------------------------------------------------------
describe('addAffiliationToFormData', () => {
  it('adds affiliation to formData.affiliation', () => {
    const formData = { affiliation: [] };
    const result = addAffiliationToFormData(formData, 'org-1');
    expect(result.affiliation).toEqual(['org-1']);
  });

  it('does not add duplicate affiliation', () => {
    const formData = { affiliation: ['org-1'] };
    const result = addAffiliationToFormData(formData, 'org-1');
    expect(result.affiliation).toHaveLength(1);
  });

  it('returns same formData reference when affiliation already exists', () => {
    const formData = { affiliation: ['org-1'] };
    const result = addAffiliationToFormData(formData, 'org-1');
    expect(result).toBe(formData);
  });

  it('initialises formData.affiliation when missing', () => {
    const formData = { name: 'test' };
    const result = addAffiliationToFormData(formData, 'org-2');
    expect(result.affiliation).toEqual(['org-2']);
    expect(result.name).toBe('test');
  });

  it('preserves other formData fields', () => {
    const formData = { affiliation: [], language: [lang(1)] };
    const result = addAffiliationToFormData(formData, 'org-1');
    expect(result.language).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// addTerritoryToFormData
// ---------------------------------------------------------------------------
describe('addTerritoryToFormData', () => {
  it('adds territory to formData.territory', () => {
    const formData = { territory: [] };
    const result = addTerritoryToFormData(formData, 'SSA');
    expect(result.territory).toEqual(['SSA']);
  });

  it('does not add duplicate territory', () => {
    const formData = { territory: ['SSA'] };
    const result = addTerritoryToFormData(formData, 'SSA');
    expect(result.territory).toHaveLength(1);
  });

  it('returns same formData reference when territory already exists', () => {
    const formData = { territory: ['SSA'] };
    const result = addTerritoryToFormData(formData, 'SSA');
    expect(result).toBe(formData);
  });

  it('initialises formData.territory when missing', () => {
    const formData = {};
    const result = addTerritoryToFormData(formData, 'NWE');
    expect(result.territory).toEqual(['NWE']);
  });

  it('preserves other formData fields', () => {
    const formData = { territory: [], extra: 42 };
    const result = addTerritoryToFormData(formData, 'LAC');
    expect(result.extra).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// addProjectToFormData
// ---------------------------------------------------------------------------
describe('addProjectToFormData', () => {
  it('adds project to formData.wikimedia_project', () => {
    const formData = { wikimedia_project: [] };
    const result = addProjectToFormData(formData, 'wp');
    expect(result.wikimedia_project).toEqual(['wp']);
  });

  it('does not add duplicate project', () => {
    const formData = { wikimedia_project: ['wp'] };
    const result = addProjectToFormData(formData, 'wp');
    expect(result.wikimedia_project).toHaveLength(1);
  });

  it('returns same formData reference when project already exists', () => {
    const formData = { wikimedia_project: ['wp'] };
    const result = addProjectToFormData(formData, 'wp');
    expect(result).toBe(formData);
  });

  it('initialises formData.wikimedia_project when missing', () => {
    const formData = {};
    const result = addProjectToFormData(formData, 'wq');
    expect(result.wikimedia_project).toEqual(['wq']);
  });

  it('preserves other formData fields', () => {
    const formData = { wikimedia_project: [], user: 'alice' };
    const result = addProjectToFormData(formData, 'wk');
    expect(result.user).toBe('alice');
  });
});

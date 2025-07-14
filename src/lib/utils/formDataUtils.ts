import { LanguageProficiency } from '@/types/language';

// Utility functions to avoid duplicates in form data
export const addUniqueItem = <T>(array: T[], item: T): T[] => {
  if (!array.includes(item)) {
    return [...array, item];
  }
  return array;
};

export const addUniqueItems = <T>(array: T[], items: T[]): T[] => {
  const uniqueItems = items.filter(item => !array.includes(item));
  return [...array, ...uniqueItems];
};

// Helper function to normalize IDs for comparison
const normalizeId = (id: any): string => {
  if (id === null || id === undefined) return '';
  const normalized = String(id).trim();
  return normalized;
};

export const addUniqueCapacity = (capacities: number[], capacityId: number): number[] => {
  const normalizedCapacities = capacities.map(normalizeId);
  const normalizedCapacityId = normalizeId(capacityId);

  if (!normalizedCapacities.includes(normalizedCapacityId)) {
    return [...capacities, capacityId];
  }
  return capacities;
};

export const addUniqueCapacities = (capacities: number[], newCapacities: number[]): number[] => {
  const normalizedCapacities = capacities.map(normalizeId);
  const uniqueItems = newCapacities.filter(capacityId => {
    const normalizedCapacityId = normalizeId(capacityId);
    return !normalizedCapacities.includes(normalizedCapacityId);
  });
  return [...capacities, ...uniqueItems];
};

export const addUniqueLanguage = (
  languages: LanguageProficiency[],
  language: LanguageProficiency
): LanguageProficiency[] => {
  const existingLanguage = languages.find(
    lang => normalizeId(lang.id) === normalizeId(language.id)
  );
  if (!existingLanguage) {
    return [...languages, language];
  }
  return languages;
};

export const addUniqueLanguages = (
  languages: LanguageProficiency[],
  newLanguages: LanguageProficiency[]
): LanguageProficiency[] => {
  const normalizedExistingIds = languages.map(lang => normalizeId(lang.id));
  const uniqueLanguages = newLanguages.filter(language => {
    const normalizedId = normalizeId(language.id);
    return !normalizedExistingIds.includes(normalizedId);
  });
  return [...languages, ...uniqueLanguages];
};

export const addUniqueAffiliation = (affiliations: string[], affiliationId: string): string[] => {
  return addUniqueItem(affiliations, affiliationId);
};

export const addUniqueAffiliations = (
  affiliations: string[],
  newAffiliations: string[]
): string[] => {
  const normalizedAffiliations = affiliations.map(normalizeId);
  const uniqueItems = newAffiliations.filter(affiliationId => {
    const normalizedId = normalizeId(affiliationId);
    return !normalizedAffiliations.includes(normalizedId);
  });
  const result = [...affiliations, ...uniqueItems];
  return result;
};

export const addUniqueTerritory = (territories: string[], territoryId: string): string[] => {
  // If there is no territory to add, return the current array
  if (!territoryId || territoryId === '') {
    return territories;
  }

  const normalizedTerritories = territories.map(normalizeId);
  const normalizedTerritoryId = normalizeId(territoryId);

  if (!normalizedTerritories.includes(normalizedTerritoryId)) {
    const result = [...territories, territoryId];
    return result;
  }
  return territories;
};

export const addUniqueProject = (projects: string[], project: string): string[] => {
  return addUniqueItem(projects, project);
};

export const addUniqueProjects = (projects: string[], newProjects: string[]): string[] => {
  return addUniqueItems(projects, newProjects);
};

// Functions for adding languages and affiliations in view components
export const addLanguageToFormData = (
  formData: any,
  languageId: number,
  proficiency: string = '3',
  languageName?: string
): any => {
  const newLanguage: LanguageProficiency = {
    id: languageId,
    proficiency,
    name: languageName || `Language ${languageId}`,
  };
  const currentLanguages = formData.language || [];

  // Check if language already exists using normalized comparison
  const existingLanguage = currentLanguages.find(
    (lang: LanguageProficiency) => normalizeId(lang.id) === normalizeId(languageId)
  );
  if (existingLanguage) {
    return formData; // Don't add if already exists
  }

  return {
    ...formData,
    language: [...currentLanguages, newLanguage],
  };
};

export const addAffiliationToFormData = (formData: any, affiliationId: string): any => {
  const currentAffiliations = formData.affiliation || [];

  // Check if affiliation already exists using normalized comparison
  const normalizedAffiliations = currentAffiliations.map(normalizeId);
  const normalizedAffiliationId = normalizeId(affiliationId);

  if (normalizedAffiliations.includes(normalizedAffiliationId)) {
    return formData; // Don't add if already exists
  }

  return {
    ...formData,
    affiliation: [...currentAffiliations, affiliationId],
  };
};

export const addTerritoryToFormData = (formData: any, territoryId: string): any => {
  const currentTerritories = formData.territory || [];

  // Check if territory already exists using normalized comparison
  const normalizedTerritories = currentTerritories.map(normalizeId);
  const normalizedTerritoryId = normalizeId(territoryId);

  if (normalizedTerritories.includes(normalizedTerritoryId)) {
    return formData; // Don't add if already exists
  }

  return {
    ...formData,
    territory: [...currentTerritories, territoryId],
  };
};

export const addProjectToFormData = (formData: any, projectId: string): any => {
  const currentProjects = formData.wikimedia_project || [];

  // Check if project already exists using normalized comparison
  const normalizedProjects = currentProjects.map(normalizeId);
  const normalizedProjectId = normalizeId(projectId);

  if (normalizedProjects.includes(normalizedProjectId)) {
    return formData; // Don't add if already exists
  }

  return {
    ...formData,
    wikimedia_project: [...currentProjects, projectId],
  };
};

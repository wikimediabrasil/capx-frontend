import { LanguageProficiency } from "@/types/language";

// Utility functions to avoid duplicates in form data
export const addUniqueItem = <T,>(array: T[], item: T): T[] => {
  if (!array.includes(item)) {
    return [...array, item];
  }
  return array;
};

export const addUniqueItems = <T,>(array: T[], items: T[]): T[] => {
  const uniqueItems = items.filter(item => !array.includes(item));
  return [...array, ...uniqueItems];
};

export const addUniqueCapacity = (capacities: number[], capacityId: number): number[] => {
  return addUniqueItem(capacities, capacityId);
};

export const addUniqueCapacities = (capacities: number[], newCapacities: number[]): number[] => {
  return addUniqueItems(capacities, newCapacities);
};

export const addUniqueLanguage = (languages: LanguageProficiency[], language: LanguageProficiency): LanguageProficiency[] => {
  // Check if language with same id already exists
  const existingLanguage = languages.find(lang => lang.id === language.id);
  if (!existingLanguage) {
    return [...languages, language];
  }
  return languages;
};

export const addUniqueLanguages = (languages: LanguageProficiency[], newLanguages: LanguageProficiency[]): LanguageProficiency[] => {
  const uniqueLanguages = newLanguages.filter(newLang => 
    !languages.some(existingLang => existingLang.id === newLang.id)
  );
  return [...languages, ...uniqueLanguages];
};

export const addUniqueAffiliation = (affiliations: string[], affiliationId: string): string[] => {
  return addUniqueItem(affiliations, affiliationId);
};

export const addUniqueAffiliations = (affiliations: string[], newAffiliations: string[]): string[] => {
  return addUniqueItems(affiliations, newAffiliations);
};

export const addUniqueTerritory = (territories: string[], territoryId: string): string[] => {
  return addUniqueItem(territories, territoryId);
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
  proficiency: string = "3",
  languageName?: string
): any => {
  const newLanguage: LanguageProficiency = { 
    id: languageId, 
    proficiency,
    name: languageName || `Language ${languageId}`
  };
  const currentLanguages = formData.language || [];
  
  // Check if language already exists
  const existingLanguage = currentLanguages.find((lang: LanguageProficiency) => lang.id === languageId);
  if (existingLanguage) {
    return formData; // Don't add if already exists
  }
  
  return {
    ...formData,
    language: [...currentLanguages, newLanguage],
  };
};

export const addAffiliationToFormData = (
  formData: any, 
  affiliationId: string
): any => {
  const currentAffiliations = formData.affiliation || [];
  
  // Check if affiliation already exists
  if (currentAffiliations.includes(affiliationId)) {
    return formData; // Don't add if already exists
  }
  
  return {
    ...formData,
    affiliation: [...currentAffiliations, affiliationId],
  };
}; 
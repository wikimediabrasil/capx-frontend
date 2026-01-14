import { fetchMetabase, fetchWikidata } from '@/lib/utils/capacitiesUtils';
import axios, { AxiosRequestConfig } from 'axios';
import { Capacities, CapacityResponse, QueryData } from '../types/capacity';

export const fetchAllCapacities = async (token: string): Promise<Capacities[]> => {
  const response = await axios.get<Capacities[]>(`/api/skill/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
    params: {
      limit: 1000,
      offset: 0,
    },
  });
  return response.data;
};

export const capacityService = {
  async fetchCapacities(
    queryData: QueryData,
    _language: string = 'en'
  ): Promise<CapacityResponse[]> {
    try {
      const response = await axios.get('/api/capacity', {
        params: queryData.params,
        headers: queryData.headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching capacities:', error);
      throw error;
    }
  },

  async fetchCapacitiesByType(
    type: string,
    config?: AxiosRequestConfig,
    language: string = 'en'
  ): Promise<Record<string, any>> {
    try {
      const response = await axios.get(`/api/capacity/type/${type}`, {
        ...config,
        params: {
          ...config?.params,
          language,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching capacities by type ${type}:`, error);
      throw error;
    }
  },

  async fetchCapacityById(
    id: string,
    config?: AxiosRequestConfig,
    _language: string = 'en'
  ): Promise<CapacityResponse> {
    try {
      const response = await axios.get(`/api/capacity/${id}`, config);
      return response.data;
    } catch (error) {
      console.error(`Error fetching capacity by id ${id}:`, error);
      throw error;
    }
  },

  async searchCapacities(
    search: string,
    config?: AxiosRequestConfig,
    _language: string = 'en'
  ): Promise<CapacityResponse[]> {
    try {
      const response = await axios.get('/api/capacity/search', {
        ...config,
        params: { ...config?.params, q: search },
      });
      return response.data;
    } catch (error) {
      console.error(`Error searching capacities with query "${search}":`, error);
      throw error;
    }
  },

  // Função para buscar traduções do Metabase
  async fetchMetabaseTranslations(
    codes: Array<{ code: number; wd_code: string }>,
    language: string
  ) {
    try {
      return await fetchMetabase(codes, language);
    } catch (error) {
      console.error('Error fetching Metabase translations:', error);
      return [];
    }
  },

  // Função para buscar traduções do Wikidata
  async fetchWikidataTranslations(
    codes: Array<{ code: number; wd_code: string }>,
    language: string
  ) {
    try {
      return await fetchWikidata(codes, language);
    } catch (error) {
      console.error('Error fetching Wikidata translations:', error);
      return [];
    }
  },

  // Função para buscar traduções com fallback (Metabase primeiro, Wikidata depois)
  async fetchTranslationsWithFallback(
    codes: Array<{ code: number; wd_code: string }>,
    language: string
  ) {
    try {
      // Try Metabase first
      let translations = await this.fetchMetabaseTranslations(codes, language);

      // If no results from Metabase, try Wikidata as fallback
      if (!translations || translations.length === 0) {
        translations = await this.fetchWikidataTranslations(codes, language);
      }

      return translations || [];
    } catch (error) {
      console.error('Error in fetchTranslationsWithFallback:', error);
      return [];
    }
  },

  async fetchCapacityDescription(
    code: number,
    config?: AxiosRequestConfig,
    language: string = 'en'
  ) {
    const response = await axios.get(`/api/capacity/${code}`, {
      ...config,
      params: {
        ...config?.params,
        language,
      },
    });
    return {
      name: response.data.name || '',
      description: response.data.description || '',
      wdCode: response.data.wd_code || '',
      metabaseCode: response.data.metabase_code || '',
    };
  },
};

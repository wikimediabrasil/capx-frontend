import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { capacityService } from '@/services/capacityService';
import { CAPACITY_CACHE_KEYS } from './useCapacities';
import { CapacityResponse as _CapacityResponse } from '@/types/capacity';

interface CapacityProfileData {
  description: string;
  name: string;
  code: string;
  color?: string;
  icon?: string;
  parentCode?: string;
}

export function useCapacityProfile(selectedCapacityId: string, language: string = 'en') {
  const { status, data: session } = useSession();
  const token = session?.user?.token;

  const {
    data: selectedCapacityData,
    isLoading,
    refetch,
  } = useQuery<CapacityProfileData | null>({
    queryKey: [...CAPACITY_CACHE_KEYS.byId(Number(selectedCapacityId), language), 'profile'],
    queryFn: async () => {
      if (!selectedCapacityId || !token) return null;

      const _queryData = {
        params: { language },
        headers: {
          Authorization: `Token ${token}`,
        },
      };

      const response = await capacityService.fetchCapacityById(selectedCapacityId);

      // Transformar a resposta da API para o formato CapacityProfileData
      const capacityData: CapacityProfileData = {
        description: response.description || '',
        name: response.name,
        code: response.code,
        // Propriedades opcionais são deixadas indefinidas se não existirem na resposta
      };

      return capacityData;
    },
    enabled: !!selectedCapacityId && status === 'authenticated',
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas em cache
  });

  // Função para forçar a atualização dos dados
  const refreshCapacityData = (_newLanguage: string = language) => {
    return refetch();
  };

  return {
    selectedCapacityData,
    refreshCapacityData,
    isLoading: isLoading || status === 'loading',
  };
}

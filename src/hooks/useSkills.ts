'use client';

import { skillService } from '@/services/skillService';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

export function useSkills(limit?: number, offset?: number) {
  const { data: session } = useSession();
  const token = session?.user?.token;

  const {
    data: skills,
    isLoading: isSkillsLoading,
    error: skillsError,
  } = useQuery({
    queryKey: ['skills', token],
    queryFn: () =>
      skillService.fetchSkills({
        headers: {
          Authorization: `Token ${token}`,
        },
        limit,
        offset,
      }),
    enabled: !!token, // Only fetch skills if there is a token
  });

  const useSkillById = (id: string) => {
    return useQuery({
      queryKey: ['skill', id, token],
      queryFn: () =>
        skillService.fetchSkillById(id, {
          headers: {
            Authorization: `Token ${token}`,
          },
        }),
      enabled: !!token && !!id,
    });
  };

  return { skills, isSkillsLoading, skillsError, useSkillById };
}

import { projectsService } from '@/services/projectsService';
import { Project } from '@/types/project';
import { useEffect, useState } from 'react';

export function useProject(projectId: number, token?: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!token || !projectId) return;

      setIsLoading(true);
      try {
        const projectData = await projectsService.getProjectById(projectId, token);
        setProject(projectData);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to fetch project'));
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, token]);

  const createProject = async (data: Partial<Project>) => {
    if (!token) return;
    try {
      const createdProject = await projectsService.createProject(token, data);
      if (!createdProject || !createdProject.id) {
        throw new Error('Invalid project response from server');
      }
      setProject(createdProject);
      return createdProject;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create project'));
    }
  };

  const updateProject = async (projectId: number, data: Partial<Project>) => {
    if (!token || !projectId) return;
    try {
      const updatedProject = await projectsService.updateProject(projectId, token, data);

      setProject(updatedProject);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update project'));
    }
  };

  const deleteProject = async (projectId: number) => {
    if (!token || !projectId) return;
    try {
      await projectsService.deleteProject(projectId, token);
      setProject(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete project'));
    }
  };

  return {
    project,
    isLoading,
    error,
    updateProject,
    createProject,
    deleteProject,
  };
}

export function useProjects(projectIds?: number[], token?: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token || !projectIds?.length) return;

      setIsLoading(true);
      try {
        const projectPromises = projectIds.map(id => projectsService.getProjectById(id, token));
        const projectsData = await Promise.all(projectPromises);
        setProjects(projectsData);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Failed to fetch projects'));
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [projectIds, token]);

  return { projects, isLoading, error };
}

import { renderHook, act, waitFor } from '@testing-library/react';
import { useProject, useProjects } from '@/hooks/useProjects';

jest.mock('@/services/projectsService', () => ({
  projectsService: {
    getProjectById: jest.fn(),
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
  },
}));

import { projectsService } from '@/services/projectsService';

const mockProjectsService = projectsService as jest.Mocked<typeof projectsService>;

const mockProject = {
  id: 1,
  organization: 10,
  display_name: 'Test Project',
  profile_image: 'https://example.com/image.png',
  description: 'A test project',
  url: 'https://example.com',
  creation_date: '2024-01-01',
  creator: 1,
  related_skills: [1, 2],
};

describe('useProject', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has correct initial state', () => {
    const { result } = renderHook(() => useProject(0));

    expect(result.current.project).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('fetches project when projectId and token are provided', async () => {
    mockProjectsService.getProjectById.mockResolvedValue(mockProject as any);

    const { result } = renderHook(() => useProject(1, 'test-token'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockProjectsService.getProjectById).toHaveBeenCalledWith(1, 'test-token');
    expect(result.current.project).toEqual(mockProject);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when no token', () => {
    const { result } = renderHook(() => useProject(1, undefined));

    // isLoading stays true because effect returns early without setting it
    expect(result.current.isLoading).toBe(true);
    expect(mockProjectsService.getProjectById).not.toHaveBeenCalled();
  });

  it('does not fetch when no projectId', () => {
    const { result } = renderHook(() => useProject(0, 'test-token'));

    expect(result.current.isLoading).toBe(true);
    expect(mockProjectsService.getProjectById).not.toHaveBeenCalled();
  });

  it('sets error when getProjectById fails', async () => {
    mockProjectsService.getProjectById.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useProject(1, 'test-token'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toEqual(new Error('Not found'));
    expect(result.current.project).toBeNull();
  });

  it('createProject creates a project successfully', async () => {
    mockProjectsService.createProject.mockResolvedValue(mockProject as any);

    const { result } = renderHook(() => useProject(0, 'test-token'));

    let response: any;
    await act(async () => {
      response = await result.current.createProject({ display_name: 'New Project' });
    });

    expect(mockProjectsService.createProject).toHaveBeenCalledWith('test-token', {
      display_name: 'New Project',
    });
    expect(response).toEqual(mockProject);
    expect(result.current.project).toEqual(mockProject);
  });

  it('createProject does nothing when no token', async () => {
    const { result } = renderHook(() => useProject(0));

    await act(async () => {
      await result.current.createProject({ display_name: 'New Project' });
    });

    expect(mockProjectsService.createProject).not.toHaveBeenCalled();
  });

  it('createProject sets error when API returns invalid response', async () => {
    mockProjectsService.createProject.mockResolvedValue({ id: undefined } as any);

    const { result } = renderHook(() => useProject(0, 'test-token'));

    await act(async () => {
      await result.current.createProject({ display_name: 'Bad Project' });
    });

    expect(result.current.error?.message).toBe('Invalid project response from server');
  });

  it('updateProject updates a project successfully', async () => {
    const updatedProject = { ...mockProject, display_name: 'Updated Project' };
    mockProjectsService.getProjectById.mockResolvedValue(mockProject as any);
    mockProjectsService.updateProject.mockResolvedValue(updatedProject as any);

    const { result } = renderHook(() => useProject(1, 'test-token'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateProject(1, { display_name: 'Updated Project' });
    });

    expect(mockProjectsService.updateProject).toHaveBeenCalledWith(1, 'test-token', {
      display_name: 'Updated Project',
    });
    expect(result.current.project).toEqual(updatedProject);
  });

  it('updateProject does nothing when no token', async () => {
    const { result } = renderHook(() => useProject(1));

    await act(async () => {
      await result.current.updateProject(1, { display_name: 'Updated Project' });
    });

    expect(mockProjectsService.updateProject).not.toHaveBeenCalled();
  });

  it('deleteProject deletes project and clears state', async () => {
    mockProjectsService.getProjectById.mockResolvedValue(mockProject as any);
    mockProjectsService.deleteProject.mockResolvedValue(undefined);

    const { result } = renderHook(() => useProject(1, 'test-token'));

    await waitFor(() => expect(result.current.project).toEqual(mockProject));

    await act(async () => {
      await result.current.deleteProject(1);
    });

    expect(mockProjectsService.deleteProject).toHaveBeenCalledWith(1, 'test-token');
    expect(result.current.project).toBeNull();
  });

  it('deleteProject does nothing when no token', async () => {
    const { result } = renderHook(() => useProject(1));

    await act(async () => {
      await result.current.deleteProject(1);
    });

    expect(mockProjectsService.deleteProject).not.toHaveBeenCalled();
  });

  it('deleteProject sets error on failure', async () => {
    mockProjectsService.deleteProject.mockRejectedValue(new Error('Delete failed'));

    const { result } = renderHook(() => useProject(1, 'test-token'));

    await act(async () => {
      await result.current.deleteProject(1);
    });

    expect(result.current.error).toEqual(new Error('Delete failed'));
  });
});

describe('useProjects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has correct initial state', () => {
    const { result } = renderHook(() => useProjects());

    expect(result.current.projects).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when no token', () => {
    const { result } = renderHook(() => useProjects([1, 2], undefined));

    expect(result.current.isLoading).toBe(false);
    expect(mockProjectsService.getProjectById).not.toHaveBeenCalled();
  });

  it('does not fetch when no projectIds', () => {
    const { result } = renderHook(() => useProjects([], 'test-token'));

    expect(result.current.isLoading).toBe(false);
    expect(mockProjectsService.getProjectById).not.toHaveBeenCalled();
  });

  it('fetches multiple projects by IDs', async () => {
    const project2 = { ...mockProject, id: 2 };
    mockProjectsService.getProjectById
      .mockResolvedValueOnce(mockProject as any)
      .mockResolvedValueOnce(project2 as any);

    const ids = [1, 2];
    const { result } = renderHook(() => useProjects(ids, 'test-token'));

    await waitFor(() => {
      expect(result.current.projects).toHaveLength(2);
    });

    expect(mockProjectsService.getProjectById).toHaveBeenCalledWith(1, 'test-token');
    expect(mockProjectsService.getProjectById).toHaveBeenCalledWith(2, 'test-token');
  });

  it('sets error when fetching projects fails', async () => {
    mockProjectsService.getProjectById.mockRejectedValue(new Error('Failed to fetch'));

    const ids = [1];
    const { result } = renderHook(() => useProjects(ids, 'test-token'));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error).toEqual(new Error('Failed to fetch'));
    expect(result.current.projects).toEqual([]);
  });
});

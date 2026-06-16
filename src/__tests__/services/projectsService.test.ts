import axios from 'axios';
import { projectsService } from '@/services/projectsService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('projectsService', () => {
  const token = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProjects', () => {
    it('should GET /api/projects with auth header', async () => {
      const mockProjects = { count: 2, results: [{ id: 1 }, { id: 2 }] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockProjects });

      const result = await projectsService.getProjects(token);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/projects', {
        headers: { Authorization: `Token ${token}` },
        params: { limit: undefined, offset: undefined },
      });
      expect(result).toEqual(mockProjects);
    });

    it('should pass limit and offset when provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await projectsService.getProjects(token, 10, 20);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/projects', {
        headers: { Authorization: `Token ${token}` },
        params: { limit: 10, offset: 20 },
      });
    });

    it('should return the data from the API', async () => {
      const mockData = { count: 1, results: [{ id: 5, display_name: 'Project X' }] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await projectsService.getProjects(token);

      expect(result).toEqual(mockData);
    });

    it('should throw on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(projectsService.getProjects(token)).rejects.toThrow('Network error');
    });
  });

  describe('getProjectById', () => {
    it('should GET /api/projects/{id} with auth header', async () => {
      const mockProject = { id: 3, display_name: 'Project Y' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockProject });

      const result = await projectsService.getProjectById(3, token);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/projects/3', {
        headers: { Authorization: `Token ${token}` },
      });
      expect(result).toEqual(mockProject);
    });

    it('should throw on 404 not found', async () => {
      const error = { response: { status: 404, data: { detail: 'Not found.' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(projectsService.getProjectById(999, token)).rejects.toEqual(error);
    });

    it('should throw on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(projectsService.getProjectById(1, token)).rejects.toThrow('Network error');
    });
  });

  describe('updateProject', () => {
    const projectData = { display_name: 'Updated Project' };

    it('should PUT /api/projects/{id}/ with JSON content type', async () => {
      const mockUpdated = { id: 1, display_name: 'Updated Project' };
      mockedAxios.put.mockResolvedValueOnce({ data: mockUpdated });

      const result = await projectsService.updateProject(1, token, projectData);

      expect(mockedAxios.put).toHaveBeenCalledWith('/api/projects/1/', projectData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockUpdated);
    });

    it('should throw on update error', async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(projectsService.updateProject(1, token, projectData)).rejects.toThrow(
        'Update failed'
      );
    });

    it('should throw on 400 validation error', async () => {
      const error = { response: { status: 400, data: { display_name: ['This field is required.'] } } };
      mockedAxios.put.mockRejectedValueOnce(error);

      await expect(projectsService.updateProject(1, token, {})).rejects.toEqual(error);
    });
  });

  describe('createProject', () => {
    const projectData = { display_name: 'New Project' };

    it('should POST /api/projects with auth header', async () => {
      const mockCreated = { id: 10, display_name: 'New Project' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockCreated });

      const result = await projectsService.createProject(token, projectData);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/projects', projectData, {
        headers: { Authorization: `Token ${token}` },
      });
      expect(result).toEqual(mockCreated);
    });

    it('should throw on create error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Create failed'));

      await expect(projectsService.createProject(token, projectData)).rejects.toThrow(
        'Create failed'
      );
    });
  });

  describe('deleteProject', () => {
    it('should DELETE /api/projects/{id}/ with auth header', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: null });

      await projectsService.deleteProject(5, token);

      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/projects/5/', {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('should return void on success', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: null });

      const result = await projectsService.deleteProject(5, token);

      expect(result).toBeUndefined();
    });

    it('should throw on delete error', async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(projectsService.deleteProject(5, token)).rejects.toThrow('Delete failed');
    });

    it('should throw on 404 not found', async () => {
      const error = { response: { status: 404, data: { detail: 'Not found.' } } };
      mockedAxios.delete.mockRejectedValueOnce(error);

      await expect(projectsService.deleteProject(999, token)).rejects.toEqual(error);
    });
  });
});

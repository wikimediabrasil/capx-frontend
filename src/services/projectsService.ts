import { Project } from '@/types/project';
import axios from 'axios';

export const projectsService = {
  async getProjects(token: string, limit?: number, offset?: number) {
    const response = await axios.get('/api/projects', {
      headers: { Authorization: `Token ${token}` },
      params: { limit, offset },
    });
    return response.data;
  },

  async getProjectById(projectId: number, token: string): Promise<Project> {
    try {
      const response = await axios.get(`/api/projects/${projectId}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },
  async updateProject(projectId: number, token: string, data: Partial<Project>): Promise<Project> {
    try {
      const response = await axios.put(`/api/projects/${projectId}/`, data, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  async createProject(token: string, data: Partial<Project>): Promise<Project> {
    try {
      const response = await axios.post(`/api/projects`, data, {
        headers: { Authorization: `Token ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  async deleteProject(projectId: number, token: string): Promise<void> {
    try {
      await axios.delete(`/api/projects/${projectId}/`, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },
};

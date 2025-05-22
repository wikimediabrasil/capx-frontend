import { WikimediaProjects } from "@/types/wikimediaProject";
import axios from "axios";

export const fetchWikimediaProjects = async (
  token: string | undefined
): Promise<WikimediaProjects> => {
  if (!token) {
    console.warn("No token provided to fetchWikimediaProjects");
    return {};
  }

  try {
    const response = await axios.get<WikimediaProjects>(
      `/api/list/wikimedia_project/`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
        timeout: 8000, // Add a reasonable timeout
      }
    );

    return response.data || {};
  } catch (error) {
    console.error("Error fetching wikimedia projects:", error);
    // Return empty object as fallback instead of throwing
    return {};
  }
};

export const fetchWikimediaProjectImages = async (
  projectId: number,
  token: string | undefined
): Promise<string> => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  if (!token) {
    throw new Error("Token is required");
  }

  try {
    const response = await axios.get<{
      wikimedia_project_picture: string;
    }>(`/api/wikimedia_project/${projectId}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
      timeout: 8000, // Add a reasonable timeout
    });

    if (!response.data?.wikimedia_project_picture) {
      throw new Error("No image found for project");
    }

    return response.data.wikimedia_project_picture;
  } catch (error) {
    console.error(`Error fetching image for project ${projectId}:`, error);
    throw error; // Re-throw to let the caller handle it
  }
};

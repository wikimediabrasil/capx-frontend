import { useState, useEffect, useCallback } from "react";
import { WikimediaProjects } from "@/types/wikimediaProject";
import {
  fetchWikimediaProjects,
  fetchWikimediaProjectImages,
} from "@/services/wikimediaProjectService";

export const useWikimediaProject = (
  token: string | undefined,
  projectIds?: number[]
) => {
  const [wikimediaProjects, setWikimediaProjects] = useState<WikimediaProjects>(
    {}
  );
  const [wikimediaProjectImages, setWikimediaProjectImages] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWikimediaProjects = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await fetchWikimediaProjects(token);
      setWikimediaProjects(data);
    } catch (err) {
      console.error("Error loading Wikimedia projects:", err);
      // Provide an empty object as fallback
      setWikimediaProjects({});
      setError(
        err instanceof Error ? err.message : "Failed to load wikimedia projects"
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadWikimediaProjects();
  }, [loadWikimediaProjects]);

  useEffect(() => {
    if (!projectIds?.length || !token) {
      return;
    }

    const loadWikimediaProjectImages = async () => {
      try {
        const images: Record<string, string> = {};
        for (const projectId of projectIds) {
          if (projectId) {
            try {
              const image = await fetchWikimediaProjectImages(projectId, token);
              images[projectId] = image;
            } catch (imageError) {
              console.warn(
                `Failed to load image for project ${projectId}:`,
                imageError
              );
            }
          }
        }
        setWikimediaProjectImages(images);
      } catch (err) {
        console.error("Error loading Wikimedia project images:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load wikimedia project images"
        );
      }
    };

    loadWikimediaProjectImages();
  }, [token, projectIds]);

  // Add a retry method
  const retry = useCallback(() => {
    setError(null);
    setLoading(true);
    loadWikimediaProjects();
  }, [loadWikimediaProjects]);

  return {
    wikimediaProjects,
    loading,
    error,
    wikimediaProjectImages,
    retry,
  };
};

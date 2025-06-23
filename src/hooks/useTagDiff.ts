'use client';

import { useState } from 'react';
import { tagDiffService } from '@/services/tagDiffService';
import { tagDiff } from '@/types/tagDiff';

export const useTagDiff = (token?: string, id?: number, limit?: number, offset?: number) => {
  const [tagDiff, setTagDiff] = useState<tagDiff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    if (!token) {
      console.error('fetchNews: No token provided');
      return;
    }
    try {
      setLoading(true);
      const tagDiff = await tagDiffService.fetchAllNews(token, limit, offset);
      setTagDiff(tagDiff);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleTag = async (id: number) => {
    if (!token || !id) {
      console.error('fetchSingleNews: Missing token or id');
      return;
    }
    try {
      setLoading(true);
      const tagDiff = await tagDiffService.fetchSingleNews(token, id);
      setTagDiff(prev => [...prev, tagDiff]);
      return tagDiff;
    } catch (error) {
      console.error('Error fetching single news:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch single news');
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (data: Partial<tagDiff>) => {
    if (!token) {
      console.error('createTag: No token provided');
      return null;
    }
    try {
      setLoading(true);
      const response = await tagDiffService.createTag(data, token);

      if (!response || !response.id) {
        throw new Error('Invalid response from tag creation');
      }
      return response;
    } catch (error) {
      console.error('useTagDiff - Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create tag');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTag = async (newsId: number) => {
    if (!token) {
      console.error('deleteNews: No token provided');
      return;
    }
    try {
      setLoading(true);
      await tagDiffService.deleteNews(token, newsId);
      setTagDiff(prev => prev.filter(n => n.id !== newsId));
    } catch (error) {
      console.error('Error deleting news:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete news');
    } finally {
      setLoading(false);
    }
  };

  return {
    tagDiff,
    loading,
    error,
    fetchTags,
    fetchSingleTag,
    createTag,
    deleteTag,
  };
};

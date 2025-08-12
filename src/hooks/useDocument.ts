'use client';

import { useState, useEffect } from 'react';
import { documentService } from '@/services/documentService';
import { OrganizationDocument, WikimediaDocument } from '@/types/document';
import { fetchWikimediaData } from '@/lib/utils/fetchWikimediaData';
import { normalizeDocumentUrl, validateCapXDocumentUrl } from '@/lib/utils/validateDocumentUrl';
import { ensureCommonsPageUrl } from '@/lib/utils/convertWikimediaUrl';

export const useDocument = (token?: string, id?: number, limit?: number, offset?: number) => {
  const [documents, setDocuments] = useState<WikimediaDocument[]>([]);
  const [document, setDocument] = useState<WikimediaDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllDocuments = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await documentService.fetchAllDocuments(token, limit, offset);

      // Map to ensure IDs and URLs are correct
      const formattedDocs = response.map(doc => ({
        ...doc,
        id: doc.id || 0,
        url: doc.url || '',
      }));

      setDocuments(formattedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleDocument = async () => {
    if (!token || !id) return;

    setLoading(true);
    try {
      const basicDocument = await documentService.fetchSingleDocument(token, id);
      if (basicDocument) {
        const enrichedDocument = await fetchWikimediaData(basicDocument.url || '');
        setDocument(enrichedDocument);
        return enrichedDocument;
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to fetch document');
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (data: Partial<OrganizationDocument>) => {
    if (!token) {
      console.error('createDocument: No token provided');
      return;
    }

    // Validate the input data
    if (!data || !data.url || data.url.trim() === '') {
      console.error('createDocument: Invalid URL provided', data);
      throw new Error('URL is required to create a document');
    }

    // Validate using CapX-specific rules
    const capxValidation = validateCapXDocumentUrl(data.url);
    if (!capxValidation.isValid) {
      console.error('❌ CapX URL validation failed:', {
        url: data.url,
        error: capxValidation.error,
        suggestion: capxValidation.suggestion,
      });
      throw new Error(capxValidation.error || 'Invalid URL format');
    }

    // Also run general validation and normalize
    const normalizedUrl = normalizeDocumentUrl(data.url);

    // Convert to Commons page URL format if it's a Wikimedia URL
    const commonsUrl = ensureCommonsPageUrl(normalizedUrl);

    try {
      const documentPayload = {
        ...data, // Include all fields from the original data
        url: commonsUrl, // Use the Commons page URL format expected by the backend
      };

      const response = await documentService.createDocument(token, documentPayload);

      if (response && response.id) {
        const enrichedDocument = await fetchWikimediaData(response.url || '');
        setDocument(enrichedDocument);
      }

      return response;
    } catch (error: any) {
      console.error('useDocument - Error:', error.message);
      throw error;
    }
  };

  const deleteDocument = async (id: number) => {
    if (!token) return;

    try {
      await documentService.deleteDocument(token, id);
      setDocument(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  };

  // Load all documents when the component is initialized
  useEffect(() => {
    if (token && !id) {
      fetchAllDocuments();
    }
  }, [token]);

  // Load document when the ID changes
  useEffect(() => {
    if (id) {
      fetchSingleDocument();
    }
  }, [id, token]);

  return {
    documents,
    document,
    loading,
    error,
    fetchAllDocuments,
    fetchSingleDocument,
    createDocument,
    deleteDocument,
  };
};

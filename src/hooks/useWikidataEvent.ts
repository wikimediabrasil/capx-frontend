import { useState } from 'react';
import { Event } from '@/types/event';
import {
  fetchEventDataByURL,
  fetchEventDataByQID,
  fetchEventDataByGenericURL,
} from '@/services/metabaseService';

interface UseWikidataEventReturn {
  eventData: Partial<Event> | null;
  loading: boolean;
  error: Error | null;
  fetchByURL: (url: string) => Promise<void>;
  fetchByQID: (qid: string) => Promise<void>;
  fetchByGenericURL: (url: string) => Promise<void>;
}

/**
 * Hook to fetch and manage event data from various sources (Wikidata, Wikimedia, WikiLearn)
 * @returns Object with event data, loading states and search functions
 */
export function useWikidataEvent(): UseWikidataEventReturn {
  const [eventData, setEventData] = useState<Partial<Event> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch event data from Wikidata URL
   * @param url - Wikidata URL
   */
  const fetchByURL = async (url: string): Promise<void> => {
    if (!url) {
      setError(new Error('URL not provided'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await fetchEventDataByURL(url);
      setEventData(data);

      if (!data) {
        setError(new Error('Unable to fetch event data'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error fetching data'));
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch event data from Wikidata QID
   * @param qid - Wikidata QID (ex: Q12345)
   */
  const fetchByQID = async (qid: string): Promise<void> => {
    if (!qid) {
      setError(new Error('QID not provided'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await fetchEventDataByQID(qid);
      setEventData(data);

      if (!data) {
        setError(new Error('Unable to fetch event data'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error fetching data'));
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch event data from any URL (Wikidata, Wikimedia or WikiLearn)
   * @param url - Generic URL
   */
  const fetchByGenericURL = async (url: string): Promise<void> => {
    if (!url) {
      setError(new Error('URL not provided'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await fetchEventDataByGenericURL(url);
      setEventData(data);

      if (!data) {
        setError(new Error('Unable to fetch event data from this URL'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error fetching data'));
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    eventData,
    loading,
    error,
    fetchByURL,
    fetchByQID,
    fetchByGenericURL,
  };
}

export default useWikidataEvent;

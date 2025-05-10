import { useState, useEffect } from "react";
import { Event } from "@/types/event";
import {
  fetchEventDataByURL,
  fetchEventDataByQID,
  fetchEventDataByGenericURL,
} from "@/services/metabaseService";

interface UseWikidataEventReturn {
  eventData: Partial<Event> | null;
  loading: boolean;
  error: Error | null;
  fetchByURL: (url: string) => Promise<void>;
  fetchByQID: (qid: string) => Promise<void>;
  fetchByGenericURL: (url: string) => Promise<void>;
}

/**
 * Hook para buscar e gerenciar dados de eventos de várias fontes (Wikidata, Wikimedia, WikiLearn)
 * @returns Objeto com dados do evento, estados de carregamento e funções de busca
 */
export function useWikidataEvent(): UseWikidataEventReturn {
  const [eventData, setEventData] = useState<Partial<Event> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Busca dados de evento a partir da URL do Wikidata
   * @param url - URL do Wikidata
   */
  const fetchByURL = async (url: string): Promise<void> => {
    if (!url) {
      setError(new Error("URL não fornecida"));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await fetchEventDataByURL(url);
      setEventData(data);

      if (!data) {
        setError(new Error("Não foi possível obter dados do evento"));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Erro desconhecido ao buscar dados")
      );
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca dados de evento a partir do QID do Wikidata
   * @param qid - QID do Wikidata (ex: Q12345)
   */
  const fetchByQID = async (qid: string): Promise<void> => {
    if (!qid) {
      setError(new Error("QID não fornecido"));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await fetchEventDataByQID(qid);
      setEventData(data);

      if (!data) {
        setError(new Error("Não foi possível obter dados do evento"));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Erro desconhecido ao buscar dados")
      );
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca dados de evento a partir de qualquer URL (Wikidata, Wikimedia ou WikiLearn)
   * @param url - URL genérica
   */
  const fetchByGenericURL = async (url: string): Promise<void> => {
    if (!url) {
      setError(new Error("URL não fornecida"));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await fetchEventDataByGenericURL(url);
      setEventData(data);

      if (!data) {
        setError(
          new Error("Não foi possível obter dados do evento a partir desta URL")
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Erro desconhecido ao buscar dados")
      );
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

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { LetsConnectService } from '@/services/letsConnectService';
import { LetsConnect } from '@/types/lets_connect';
import { LetsConnectProfile } from '@/types/profile';

export function useLetsConnect() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [letsConnectData, setLetsConnectData] = useState<LetsConnectProfile | null>(null);
  const submitLetsConnectForm = async (letsConnect: Partial<LetsConnect>) => {
    setIsSubmitting(true);
    try {
      const response = await LetsConnectService.submitLetsConnectForm({
        letsConnect,
        token: session?.user.token ?? '',
      });
      if (!response) {
        throw new Error('Invalid lets connect data from server');
      }
      return response;
    } catch (error) {
      console.error('Error sending lets connect data', error);
      setError(error.message);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchLetsConnectData = async (username: string): Promise<LetsConnectProfile | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await LetsConnectService.getLetsConnectProfile(username);
      if (!response) {
        throw new Error('Invalid lets connect data from server');
      }
      setLetsConnectData(response);
      return response;
    } catch (err) {
      setError('Failed to fetch LetsConnect data');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user.name) {
      fetchLetsConnectData(session.user.name);
    }
  }, [session?.user?.name]);

  return {
    isSubmitting,
    showTypeSelector,
    setShowTypeSelector,
    submitLetsConnectForm,
    error,
    fetchLetsConnectData,
    letsConnectData,
    isLoading,
  };
}

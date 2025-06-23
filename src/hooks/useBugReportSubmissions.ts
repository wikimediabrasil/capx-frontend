import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BugReportService } from '@/services/bugReportService';
import { BugReport } from '@/types/report';

export function useBugReportSubmissions() {
  const { data: session } = useSession();
  const token = session?.user?.token;

  const [reports, setReports] = useState<BugReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const data = await BugReportService.getReports(token);
        setReports(data);
      } catch (error) {
        console.error('Erro ao buscar relatórios:', error);
        setError('Não foi possível carregar os relatórios');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return {
    reports,
    isLoading,
    error,
    formatDate,
  };
}

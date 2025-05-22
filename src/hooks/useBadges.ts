import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { BadgeService } from "@/services/badgeService";
import { Badge } from "@/types/badge";

export function useBadges() {
  const { data: session } = useSession();
  const token = session?.user?.token;

  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setIsLoading(true);
        const response = await BadgeService.getBadges(token);
        setBadges(response.results);
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
        });
      } catch (err) {
        setError("Failed to fetch badges");
        console.error("Error fetching badges:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [token]);

  const getBadgeById = async (badgeId: string) => {
    try {
      return await BadgeService.getBadgeById(badgeId, token);
    } catch (err) {
      setError("Failed to fetch badge");
      console.error("Error fetching badge:", err);
      throw err;
    }
  };

  return {
    badges,
    isLoading,
    error,
    pagination,
    getBadgeById,
  };
}

import { useSession } from "next-auth/react";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";

export function useApi() {
  const { data: session } = useSession();
  const token = session?.user?.token;

  return {
    get: <T>(url: string) => apiGet<T>(url, token),
    post: <T>(url: string, data: any) => apiPost<T>(url, data, token),
    put: <T>(url: string, data: any) => apiPut<T>(url, data, token),
    delete: <T>(url: string) => apiDelete<T>(url, token),
  };
}

import axios, { AxiosInstance } from "axios";
import { signOut } from "next-auth/react";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Create an axios instance with interceptors
const createAxiosInstance = (token?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.BASE_URL || "http://localhost:8000",
    headers: token
      ? {
          Authorization: `Token ${token}`,
        }
      : {},
  });

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Check if the response contains the specific invalid token message
        const responseData = error.response?.data;
        const isInvalidToken = responseData?.detail === 'Invalid token.';
        
        if (isInvalidToken && typeof window !== "undefined") {
          console.warn("Token expired detected. Performing automatic logout...");
          await signOut({ redirect: true, callbackUrl: "/" });
        }
        return Promise.reject(new Error("Unauthorized"));
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Generic HTTP functions
export const apiGet = async <T>(
  url: string,
  token?: string
): Promise<ApiResponse<T>> => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.get<T>(url);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "An error occurred",
      status: error.response?.status || 500,
    };
  }
};

export const apiPost = async <T>(
  url: string,
  data: any,
  token?: string
): Promise<ApiResponse<T>> => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.post<T>(url, data);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "An error occurred",
      status: error.response?.status || 500,
    };
  }
};

export const apiPut = async <T>(
  url: string,
  data: any,
  token?: string
): Promise<ApiResponse<T>> => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.put<T>(url, data);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "An error occurred",
      status: error.response?.status || 500,
    };
  }
};

export const apiDelete = async <T>(
  url: string,
  token?: string
): Promise<ApiResponse<T>> => {
  try {
    const api = createAxiosInstance(token);
    const response = await api.delete<T>(url);
    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: any) {
    return {
      error: error.response?.data?.message || "An error occurred",
      status: error.response?.status || 500,
    };
  }
};

import axios from "axios";

export const serverApi = axios.create({
  baseURL: process.env.BASE_URL,
});

export const clientApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const showSessionExpiredPopup = () => {
  // Trigger a custom event that will be listened by the AuthContext
  window.dispatchEvent(new CustomEvent("showSessionExpiredPopup"));
};

if (typeof window !== "undefined") {
  // Add interceptor for request
  clientApi.interceptors.request.use((config) => {
    console.log("Making request with headers:", config.headers);
    return config;
  });

  clientApi.interceptors.response.use(
    (response) => response,
    async (error) => {
      console.log("Error in response:", {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.config?.headers,
      });

      // Check if it's an invalid token error
      if (
        error.response?.status === 401 &&
        error.response?.data?.detail === "Invalid token." &&
        error.config?.headers?.Authorization
      ) {
        console.log("Token expired detected, starting logout...");
        showSessionExpiredPopup();
        return new Promise(() => {});
      }

      return Promise.reject(error);
    }
  );
}

// In API routes, use Response instead of NextResponse
export const handle401Error = () => {
  return new Response(JSON.stringify({ detail: "Invalid token." }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
};

export default clientApi;

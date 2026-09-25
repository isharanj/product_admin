import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, AUTH_TOKEN_COOKIE, ROUTES } from "@/lib/auth/constants";
import { clearAuth, getAccessToken } from "@/lib/auth/storage";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuthRedirect?: boolean;
  }
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.baseURL = API_BASE_URL;
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isHandlingUnauthorized = false;

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const skipRedirect = error.config?.skipAuthRedirect;
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (
      status === 401 &&
      !skipRedirect &&
      !isLoginRequest &&
      typeof window !== "undefined" &&
      !isHandlingUnauthorized
    ) {
      isHandlingUnauthorized = true;
      clearAuth();
      const currentPath = window.location.pathname;
      if (currentPath !== ROUTES.login) {
        window.location.assign(
          `${ROUTES.login}?next=${encodeURIComponent(currentPath)}`
        );
      }
      // Allow future 401 handling after navigation settles
      window.setTimeout(() => {
        isHandlingUnauthorized = false;
      }, 1000);
    }

    return Promise.reject(error);
  }
);

export { api, AUTH_TOKEN_COOKIE };
export default api;

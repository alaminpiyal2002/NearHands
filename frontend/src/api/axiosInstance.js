import axios from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from "../utils/tokenStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized = error.response?.status === 401;
    const hasNotRetriedYet = !originalRequest?._retry;
    const refreshToken = getRefreshToken();

    const isRefreshRequest = originalRequest?.url?.includes(
      "/auth/token/refresh/"
    );

    if (
      isUnauthorized &&
      hasNotRetriedYet &&
      refreshToken &&
      !isRefreshRequest
    ) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await publicApi.post("/auth/token/refresh/", {
          refresh: refreshToken,
        });

        const newAccessToken =
          refreshResponse.data?.access || refreshResponse.data?.data?.access;

        if (!newAccessToken) {
          throw new Error("Refresh response did not include access token.");
        }

        saveAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
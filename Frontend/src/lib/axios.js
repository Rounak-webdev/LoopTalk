import axios from "axios";
import { API_URL } from "./runtime";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const isDebugHttpEnabled =
  import.meta.env.DEV || import.meta.env.VITE_DEBUG_HTTP === "true";

axiosInstance.interceptors.request.use((config) => {
  if (isDebugHttpEnabled) {
    console.log("AXIOS REQUEST:", {
      method: config.method,
      url: `${config.baseURL || ""}${config.url || ""}`,
      data: config.data,
      params: config.params,
    });
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.userMessage =
        "Unable to reach the server. Check that the backend is running and CORS allows this origin.";
    }

    if (isDebugHttpEnabled) {
      console.error("AXIOS ERROR:", error.response?.data || error.userMessage || error.message);
    }

    return Promise.reject(error);
  }
);

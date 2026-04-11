import axios from "axios";
import { API_URL } from "./runtime";

export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const isDebugHttpEnabled =
  import.meta.env.DEV || import.meta.env.VITE_DEBUG_HTTP === "true";

if (isDebugHttpEnabled) {
  axiosInstance.interceptors.request.use((config) => {
    console.log("AXIOS REQUEST:", {
      method: config.method,
      url: `${config.baseURL || ""}${config.url || ""}`,
      data: config.data,
      params: config.params,
    });
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("AXIOS ERROR:", error.response?.data || error.message);
      return Promise.reject(error);
    }
  );
}

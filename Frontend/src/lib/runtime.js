const browserHost =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

const defaultApiHost =
  browserHost === "localhost" || browserHost === "127.0.0.1"
    ? "localhost"
    : browserHost;

export const API_URL =
  import.meta.env.VITE_API_URL || `http://${defaultApiHost}:5001/api`;

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  API_URL.replace(/\/api\/?$/, "");

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

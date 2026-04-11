const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const trimOrigin = (origin = "") => origin.trim().replace(/\/$/, "");

export const getAllowedOrigins = () => {
  const configuredOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map(trimOrigin)
    .filter(Boolean);

  return Array.from(new Set([...defaultOrigins, ...configuredOrigins]));
};

const privateNetworkPattern =
  /^https?:\/\/(?:(?:localhost|127\.0\.0\.1|\[::1\])|(?:192\.168\.\d{1,3}\.\d{1,3})|(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(?:172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}))(?::\d+)?$/i;

export const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = trimOrigin(origin);
  if (getAllowedOrigins().includes(normalizedOrigin)) return true;

  return privateNetworkPattern.test(normalizedOrigin);
};


import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect, useMemo, useState } from "react";
import { AppConfigContext } from "./AppConfigContext";
import { API_URL, GOOGLE_CLIENT_ID as ENV_GOOGLE_CLIENT_ID } from "../lib/runtime";

const AppProviders = ({ children }) => {
  const [googleClientId, setGoogleClientId] = useState(ENV_GOOGLE_CLIENT_ID);
  const [isGoogleReady, setIsGoogleReady] = useState(Boolean(ENV_GOOGLE_CLIENT_ID));

  useEffect(() => {
    if (ENV_GOOGLE_CLIENT_ID) return;

    let isMounted = true;

    fetch(`${API_URL}/auth/google-config`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (!isMounted) return;
        setGoogleClientId(data.clientId || "");
        setIsGoogleReady(true);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsGoogleReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      googleClientId,
      isGoogleReady,
    }),
    [googleClientId, isGoogleReady]
  );

  const content = (
    <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>
  );

  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>
  ) : (
    content
  );
};

export default AppProviders;

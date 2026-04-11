import { createContext } from "react";
import { GOOGLE_CLIENT_ID as ENV_GOOGLE_CLIENT_ID } from "../lib/runtime";

export const AppConfigContext = createContext({
  googleClientId: ENV_GOOGLE_CLIENT_ID,
  isGoogleReady: Boolean(ENV_GOOGLE_CLIENT_ID),
});

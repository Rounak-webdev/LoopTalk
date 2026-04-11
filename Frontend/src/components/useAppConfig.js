import { useContext } from "react";
import { AppConfigContext } from "./AppConfigContext";

export const useAppConfig = () => useContext(AppConfigContext);

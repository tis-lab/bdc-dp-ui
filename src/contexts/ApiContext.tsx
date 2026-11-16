import { createContext, useContext } from "react";

export type CbAccess = "open" | "auth";
const ApiBaseUrlContext = createContext<string | null>(null);
export const ApiBaseUrlProvider = ApiBaseUrlContext.Provider;

export const useQueryEndpoint = (access: CbAccess = "open"): string => {
  const base = useContext(ApiBaseUrlContext);
  if (base === null) throw new Error("CohortBuilder: apiBaseUrl prop missing");
  return `${base.replace(/\/+$/, "")}/cb/${access}/query`;
};

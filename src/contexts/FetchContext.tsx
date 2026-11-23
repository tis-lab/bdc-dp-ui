import { createContext, useContext } from "react";
/**
 * For migrating to other environment, add this line:
 * import { csrfFetch } from "@nhlbi/bdcp-frontend"
 */

export type FetchFn = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export const browserFetch: FetchFn = (input, init) => fetch(input, init);

const FetchContext = createContext<FetchFn>(browserFetch);
/**
 * For migrating to other environment, remove above line and add this line:
 * const FetchContext = createContext<FetchFn>(csrfFetch);
 */

export const FetchProvider = FetchContext.Provider;
export const useFetch = (): FetchFn => useContext(FetchContext);

import { createContext, useContext } from "react";
/**
 * For migrating to other environment, add this line:
 * import { csrfFetch } from "@nhlbi/bdcp-frontend"
 */

export interface ApiRequestInit {
  method: "POST";
  headers: Record<string, string>;
  body: string;
  signal?: AbortSignal;
}
export type FetchFn = (url: string, init: ApiRequestInit) => Promise<Response>;

export const browserFetch: FetchFn = (input, init) => fetch(input, init);

const FetchContext = createContext<FetchFn>(browserFetch);
/**
 * For migrating to other environment, remove above line and add this line:
 * const FetchContext = createContext<FetchFn>(csrfFetch);
 */

export const FetchProvider = FetchContext.Provider;
export const useFetch = (): FetchFn => useContext(FetchContext);

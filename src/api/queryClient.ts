import { QueryClient } from "@tanstack/react-query";
import { HttpError } from "./graphql/graphqlRequest";

const MAX_RETRIES = 2;

/** Retries network failures and 5xx responses; GraphQL and 4xx errors fail immediately. */
export const shouldRetry = (failureCount: number, error: Error): boolean =>
  failureCount < MAX_RETRIES &&
  (error instanceof TypeError ||
    (error instanceof HttpError && error.status >= 500));

// Created once at module scope so renders never replace it.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: shouldRetry },
  },
});

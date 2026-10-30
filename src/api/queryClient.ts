import { QueryClient } from "@tanstack/react-query";

// Created once at module scope so renders never replace it.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: false },
  },
});

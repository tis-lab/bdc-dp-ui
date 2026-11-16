import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiBaseUrlProvider } from "../contexts/ApiContext";

export const TEST_BASE_URL = "https://middleware.test";
export const OPEN_ENDPOINT = `${TEST_BASE_URL}/cb/open/query`;

export const createWrapper = (apiBaseUrl = TEST_BASE_URL) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApiBaseUrlProvider value={apiBaseUrl}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </ApiBaseUrlProvider>
  );
  return { client, wrapper };
};

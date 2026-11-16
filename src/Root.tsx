import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./api/queryClient";
import ErrorBoundary from "./components/ErrorBoundary";
import { ApiBaseUrlProvider } from "./contexts/ApiContext";

export interface CohortBuilderProps {
  /** "/api" behind framework's Apache; middleware origin when standalone. */
  apiBaseUrl: string;
}

/**
 * App-wide providers around <App />. The host must supply:
 *  - a React Router v7 router, with this application mounted under a splat route
 *    (e.g. path="/cohort-builder/*")
 *  - an MUI ThemeProvider
 *  - apiBaseUrl
 */
export default function Root({ apiBaseUrl }: CohortBuilderProps) {
  return (
    <ErrorBoundary>
      <ApiBaseUrlProvider value={apiBaseUrl}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ApiBaseUrlProvider>
    </ErrorBoundary>
  );
}

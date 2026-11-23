import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./api/queryClient";
import ErrorBoundary from "./components/ErrorBoundary";
import { browserFetch, FetchFn, FetchProvider } from "./contexts/FetchContext";
/**
 * For migrating to other environment, add this line:
 * import { csrfFetch } from "@nhlbi/bdcp-frontend"
 */

export interface CohortBuilderProps {
  fetch?: FetchFn;
}

/**
 * App-wide providers around <App />. The host must supply:
 *  - a React Router v7 router, with this application mounted under a splat route
 *    (e.g. path="/cohort-builder/*")
 *  - an MUI ThemeProvider
 */

/**
 * For migrating to other environment, change the default fetch to: csrfFetch
 */
export default function Root({ fetch = browserFetch }: CohortBuilderProps) {
  return (
    <ErrorBoundary>
      <FetchProvider value={fetch}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </FetchProvider>
    </ErrorBoundary>
  );
}

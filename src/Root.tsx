import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./api/queryClient";
import ErrorBoundary from "./components/ErrorBoundary";

/**
 * App-wide providers around <App />. The host must supply:
 *  - a React Router v7 router, with this application mounted under a splat route
 *    (e.g. path="/cohort-builder/*")
 *  - an MUI ThemeProvider
 */
export default function Root() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

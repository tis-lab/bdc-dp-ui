import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./api/queryClient";
import ErrorBoundary from "./components/ErrorBoundary";

/**
 * The root of Study Palette: app-wide providers around <App />. Both the standalone
 * app (main.tsx) and the published package (index.ts) render this, so a host
 * application does not have to supply any of these providers.
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

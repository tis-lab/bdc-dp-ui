import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./api/queryClient";

/**
 * The root of Study Palette: app-wide providers around <App />. Both the standalone
 * app (main.tsx) and the published package (index.ts) render this, so a host
 * application does not have to supply any of these providers.
 */
export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}

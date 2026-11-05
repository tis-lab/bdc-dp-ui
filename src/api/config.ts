/**
 * The GraphQL endpoint, from VITE_GRAPHQL_URL. `npm run dev` reads it from
 * .env.development; other builds must set it. Read per request, so a missing
 * value fails that request rather than the app.
 */
import { getEnv } from "./viteEnv";

export const getGraphQLEndpoint = (): string => {
  const url = getEnv("VITE_GRAPHQL_URL");
  if (!url) throw new Error("VITE_GRAPHQL_URL is not set");
  return url;
};

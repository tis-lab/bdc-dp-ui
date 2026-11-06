import { getEnv } from "./viteEnv";

/** GraphQL endpoint from VITE_GRAPHQL_URL; throws if unset. */
export const getGraphQLEndpoint = (): string => {
  const url = getEnv("VITE_GRAPHQL_URL");
  if (!url) throw new Error("VITE_GRAPHQL_URL is not set");
  return url;
};

/**
 * The GraphQL endpoint, from VITE_GRAPHQL_URL. `npm run dev` gets the shared
 * development endpoint from ui/.env.development; other builds must set it.
 * Read when a request runs, so a missing value fails that request rather than
 * the app.
 */
export function getGraphQLEndpoint(): string {
  const endpoint = import.meta.env.VITE_GRAPHQL_URL;
  if (!endpoint) {
    throw new Error("VITE_GRAPHQL_URL is not set");
  }
  return endpoint;
}

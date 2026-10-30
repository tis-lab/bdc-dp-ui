# GraphQL client

Study Palette sends GraphQL operations to the BDC middleware through TanStack Query:

```text
component → feature hook → useQuery → graphqlRequest() → GraphQL endpoint
```

Components never call `fetch` or contain GraphQL documents themselves.

## Structure

| File | Role |
|------|------|
| `src/api/queryClient.ts` | The `QueryClient`, created once at module scope |
| `src/Root.tsx` | The root: app-wide providers, including `QueryClientProvider`, around `<App />` |
| `src/api/config.ts` | `getGraphQLEndpoint()`: the endpoint, from `VITE_GRAPHQL_URL` |
| `src/api/graphql/graphqlRequest.ts` | `graphqlRequest()`: sends one operation and returns its `data` |
| `src/api/graphql/queries/` | Operations and their variable and response types |
| `src/hooks/` | Feature hooks, one per operation |

Both the standalone app (`main.tsx`) and the published package (`index.ts`, which
exports it as `CohortBuilder`) render `Root`, so a host application does not need to
supply a provider or install TanStack Query.

## Request helper

TanStack Query manages loading state, caching and refetching, but it does not send
requests. It calls whatever function a hook gives it. `graphqlRequest()` is that function
for GraphQL: it POSTs `{ query, variables }` as JSON to the endpoint and unwraps the
response.

## Adding a query

Each feature defines its operation and types in `src/api/graphql/queries/`, and its query
key and hook in `src/hooks/`. `useConceptSearch` is a working example. In outline:

```ts
// src/hooks/useExample.ts
import { useQuery } from "@tanstack/react-query";
import { getGraphQLEndpoint } from "../api/config";
import { graphqlRequest } from "../api/graphql/graphqlRequest";

const EXAMPLE_QUERY = `
  query Example($id: ID!) {
    example(id: $id) { id label }
  }
`;

interface ExampleVariables {
  id: string;
}

interface ExampleData {
  example: { id: string; label: string };
}

export function useExample(id: string) {
  return useQuery({
    queryKey: ["example", id],
    queryFn: ({ signal }) =>
      graphqlRequest<ExampleData, ExampleVariables>({
        endpoint: getGraphQLEndpoint(),
        query: EXAMPLE_QUERY,
        variables: { id },
        signal,
      }),
    enabled: id.length > 0,
  });
}
```

- **`queryKey`** must include every variable, so that changing one fetches again and each
  result is cached separately.
- **`signal`** lets TanStack Query cancel a request that is no longer needed, such as when
  the user types again or the component unmounts.
- **`enabled`** stops the query from running until it has valid input.

A component then reads `data`, `error` and `isPending` from the hook.

## Endpoint

Hooks get the endpoint from `getGraphQLEndpoint()`, which reads `VITE_GRAPHQL_URL`.
`graphqlRequest()` itself takes the endpoint as an argument and reads no configuration.

- `npm run dev` uses the shared development endpoint in `ui/.env.development`.
- Netlify builds use `/graphql`, which `netlify.toml` proxies to the middleware; the
  middleware's CORS policy does not allow the Netlify origin.
- Other builds must set `VITE_GRAPHQL_URL`. Vite inlines it at build time, so a published
  package calls the endpoint configured when it was built.
- If it is not set, each request fails with `VITE_GRAPHQL_URL is not set`; the app
  itself still loads.

## Errors

`graphqlRequest()` throws a plain `Error` when:

- the response has a non-2xx status: `GraphQL request failed: HTTP <status>`
- the response contains `errors[]`: their messages, joined with `; `
- the response has no `data`: `GraphQL response contained no data`

Network failures and cancellations surface as the original `fetch` error. TanStack Query
puts any of these on the hook's `error`, so components can display `error.message`.

TanStack Query runs with its default options: failed queries are retried 3 times, and
data is refetched when the window regains focus.

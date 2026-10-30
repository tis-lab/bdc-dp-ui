export interface GraphQLRequest<TVariables> {
  endpoint: string;
  query: string;
  variables: TVariables;
  signal?: AbortSignal;
}

interface GraphQLResponse<TData> {
  data?: TData;
  errors?: { message: string }[];
}

/** POSTs one GraphQL operation to `endpoint` and returns its `data`. */
export async function graphqlRequest<TData, TVariables extends object>({
  endpoint,
  query,
  variables,
  signal,
}: GraphQLRequest<TVariables>): Promise<TData> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    signal,
  });
  if (!response.ok) {
    throw new Error(`GraphQL request failed: HTTP ${response.status}`);
  }

  const body = (await response.json()) as GraphQLResponse<TData>;
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  if (body.data === undefined) {
    throw new Error("GraphQL response contained no data");
  }
  return body.data;
}

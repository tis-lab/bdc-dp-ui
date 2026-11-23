const XSRF_COOKIE = "XSRF-TOKEN";
const XSRF_HEADER = "X-XSRF-TOKEN";

const readCookie = (name: string): string | undefined => {
  const entry = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : undefined;
};

/** CSRF token for same-origin calls only, so it never leaks to another host. */
const xsrfHeaders = (endpoint: string): Record<string, string> => {
  if (new URL(endpoint, location.origin).origin !== location.origin) return {};
  const token = readCookie(XSRF_COOKIE);
  return token ? { [XSRF_HEADER]: token } : {};
};

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

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`GraphQL request failed: HTTP ${status}`);
    this.name = "HttpError";
    this.status = status;
  }
}

/** POSTs one GraphQL operation to `endpoint` and returns its `data`. */
export const graphqlRequest = async <TData, TVariables extends object>({
  endpoint,
  query,
  variables,
  signal,
}: GraphQLRequest<TVariables>): Promise<TData> => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...xsrfHeaders(endpoint),
    },
    body: JSON.stringify({ query, variables }),
    signal,
  });
  if (!response.ok) {
    throw new HttpError(response.status);
  }

  const body = (await response.json()) as GraphQLResponse<TData>;
  if (body.errors?.length) {
    throw new Error(body.errors.map((e) => e.message).join("; "));
  }
  if (body.data === undefined) {
    throw new Error("GraphQL response contained no data");
  }
  return body.data;
};

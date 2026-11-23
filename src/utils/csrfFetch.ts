const SAFE_METHODS: ReadonlySet<string> = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
  "TRACE",
]);
const CSRF_ENDPOINT = "/api/csrf";
const CSRF_HEADER = "X-XSRF-TOKEN";

type HeaderRecord = Record<string, string>;

interface CsrfTokenResponse {
  token?: unknown;
}

let cachedToken = "";
let tokenRequestPromise: Promise<string> | null = null;

const parseToken = (body: unknown): string => {
  if (!body || typeof body !== "object") {
    return "";
  }
  const token = (body as CsrfTokenResponse).token;
  return typeof token === "string" ? token.trim() : "";
};

const requestCsrfToken = async (): Promise<string> => {
  if (typeof fetch !== "function") {
    throw new Error("Unable to load CSRF token: fetch is unavailable");
  }

  const response = await fetch(CSRF_ENDPOINT, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load CSRF token: ${response.status} ${response.statusText}`,
    );
  }

  const body: unknown = await response.json();
  const token = parseToken(body);
  if (!token) {
    throw new Error("Unable to load CSRF token: token missing from response");
  }

  cachedToken = token;
  return token;
};

export const resetCsrfTokenCacheForTests = (): void => {
  cachedToken = "";
  tokenRequestPromise = null;
};

export const getCsrfToken = async (): Promise<string> => {
  if (cachedToken) {
    return cachedToken;
  }

  if (!tokenRequestPromise) {
    tokenRequestPromise = requestCsrfToken().finally(() => {
      tokenRequestPromise = null;
    });
  }

  return tokenRequestPromise;
};

export const refreshCsrfToken = async (): Promise<string> => {
  cachedToken = "";
  tokenRequestPromise = null;
  return getCsrfToken();
};

export const withCsrfHeaders = async (
  method: string = "GET",
  headers: HeaderRecord = {},
): Promise<HeaderRecord> => {
  const normalizedMethod = String(method || "GET").toUpperCase();
  const mergedHeaders: HeaderRecord = { ...headers };

  if (!SAFE_METHODS.has(normalizedMethod)) {
    mergedHeaders[CSRF_HEADER] = await getCsrfToken();
  }

  return mergedHeaders;
};

export interface CsrfFetchOptions extends Omit<RequestInit, "headers"> {
  headers?: HeaderRecord;
}

// Wraps fetch() with CSRF headers and transparently recovers from a stale
// cached token. The token is cached for the lifetime of the page, but the
// server-side cookie can rotate independently (e.g. Spring Security issues a
// new CSRF token after login), leaving the cached value invalid until a full
// page refresh resets the cache. Retrying once with a freshly fetched token
// avoids surfacing a 403 to the caller for that recoverable case.
export const csrfFetch = async (
  url: string | URL | Request,
  options: CsrfFetchOptions = {},
): Promise<Response> => {
  const { headers: initialHeaders = {}, ...rest } = options;
  const method = rest.method || "GET";
  const normalizedMethod = String(method || "GET").toUpperCase();

  const headers = await withCsrfHeaders(method, initialHeaders);
  const response = await fetch(url, { ...rest, headers });

  if (response.status !== 403 || SAFE_METHODS.has(normalizedMethod)) {
    return response;
  }

  // Force a fresh token fetch and retry exactly once.
  const refreshedToken = await refreshCsrfToken();
  const retryHeaders: HeaderRecord = {
    ...initialHeaders,
    [CSRF_HEADER]: refreshedToken,
  };
  return fetch(url, { ...rest, headers: retryHeaders });
};

import { graphqlRequest } from "./graphqlRequest";
import type { FetchFn } from "../../contexts/FetchContext";

// A test-only operation and endpoint; the helper is schema-agnostic.
const ENDPOINT = "/api/cb/open/query";
const QUERY = "query Echo($text: String!) { echo(text: $text) }";

interface EchoData {
  echo: string;
}

interface EchoVariables {
  text: string;
}

/** A stand-in for whatever the host injects (browser fetch or csrfFetch). */
const fetchReturning = (body: unknown, status = 200) =>
  jest
    .fn<ReturnType<FetchFn>, Parameters<FetchFn>>()
    .mockImplementation(
      async () => new Response(JSON.stringify(body), { status }),
    );

const echo = (fetch: FetchFn, signal?: AbortSignal) =>
  graphqlRequest<EchoData, EchoVariables>({
    fetch,
    endpoint: ENDPOINT,
    query: QUERY,
    variables: { text: "hello" },
    signal,
  });

describe("graphqlRequest", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns data from a successful response", async () => {
    const fetch = fetchReturning({ data: { echo: "hello" } });

    await expect(echo(fetch)).resolves.toEqual({ echo: "hello" });
  });

  it("POSTs the query and variables as JSON to the endpoint", async () => {
    const fetch = fetchReturning({ data: { echo: "hello" } });

    await echo(fetch);

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    expect(init?.method).toBe("POST");
    // A plain object, not a Headers instance: csrfFetch spreads it, and
    // spreading a Headers instance would silently drop every header.
    expect(init?.headers).toEqual({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    expect(JSON.parse(init?.body as string)).toEqual({
      query: QUERY,
      variables: { text: "hello" },
    });
  });

  it("uses only the fetch it is given, never the global one", async () => {
    const globalFetch = jest.spyOn(globalThis, "fetch");
    const fetch = fetchReturning({ data: { echo: "hello" } });

    await echo(fetch);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(globalFetch).not.toHaveBeenCalled();
  });

  it("throws the messages from errors[]", async () => {
    const fetch = fetchReturning({
      data: null,
      errors: [{ message: "Bad input" }, { message: "Also bad" }],
    });

    await expect(echo(fetch)).rejects.toThrow("Bad input; Also bad");
  });

  it("throws an HttpError with the status on a non-2xx response", async () => {
    const fetch = fetchReturning({}, 503);

    await expect(echo(fetch)).rejects.toMatchObject({
      name: "HttpError",
      status: 503,
      message: "GraphQL request failed: HTTP 503",
    });
  });

  it("throws an HttpError for a 403 the host's fetch could not recover from", async () => {
    // csrfFetch retries a 403 once with a fresh token, then returns the
    // response; a persistent 403 must surface as an HttpError (not retried).
    const fetch = fetchReturning({}, 403);

    await expect(echo(fetch)).rejects.toMatchObject({
      name: "HttpError",
      status: 403,
    });
  });

  it("throws when the response has no data", async () => {
    const fetch = fetchReturning({});

    await expect(echo(fetch)).rejects.toThrow(
      "GraphQL response contained no data",
    );
  });

  it("propagates a network failure", async () => {
    const fetch = jest
      .fn<ReturnType<FetchFn>, Parameters<FetchFn>>()
      .mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(echo(fetch)).rejects.toThrow("Failed to fetch");
  });

  it("propagates an error thrown by the host's fetch", async () => {
    // e.g. csrfFetch failing to load a token before sending anything.
    const fetch = jest
      .fn<ReturnType<FetchFn>, Parameters<FetchFn>>()
      .mockRejectedValue(new Error("Unable to load CSRF token: 500 "));

    await expect(echo(fetch)).rejects.toThrow("Unable to load CSRF token");
  });

  it("passes the signal to fetch and propagates an abort", async () => {
    const fetch = jest
      .fn<ReturnType<FetchFn>, Parameters<FetchFn>>()
      .mockImplementation(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () =>
              reject(
                new DOMException("The operation was aborted.", "AbortError"),
              ),
            );
          }),
      );
    const controller = new AbortController();

    const pending = echo(fetch, controller.signal);
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(fetch.mock.calls[0][1]?.signal).toBe(controller.signal);
  });
});

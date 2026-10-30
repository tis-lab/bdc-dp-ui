import { describe, it, expect, beforeEach, vi } from "vitest";
import { graphqlRequest } from "./graphqlRequest";

// A test-only operation and endpoint; the helper is schema-agnostic.
const ENDPOINT = "https://graphql.test/graphql";
const QUERY = "query Echo($text: String!) { echo(text: $text) }";

interface EchoData {
  echo: string;
}

interface EchoVariables {
  text: string;
}

function echo(signal?: AbortSignal) {
  return graphqlRequest<EchoData, EchoVariables>({
    endpoint: ENDPOINT,
    query: QUERY,
    variables: { text: "hello" },
    signal,
  });
}

function mockResponse(body: unknown, status = 200) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

describe("graphqlRequest", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns data from a successful response", async () => {
    mockResponse({ data: { echo: "hello" } });

    await expect(echo()).resolves.toEqual({ echo: "hello" });
  });

  it("POSTs the query and variables as JSON to the endpoint", async () => {
    const fetchSpy = mockResponse({ data: { echo: "hello" } });

    await echo();

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({
      "Content-Type": "application/json",
      Accept: "application/json",
    });
    expect(JSON.parse(init?.body as string)).toEqual({
      query: QUERY,
      variables: { text: "hello" },
    });
  });

  it("throws the messages from errors[]", async () => {
    mockResponse({ data: null, errors: [{ message: "Bad input" }, { message: "Also bad" }] });

    await expect(echo()).rejects.toThrow("Bad input; Also bad");
  });

  it("throws on a non-2xx response", async () => {
    mockResponse({}, 503);

    await expect(echo()).rejects.toThrow("GraphQL request failed: HTTP 503");
  });

  it("throws when the response has no data", async () => {
    mockResponse({});

    await expect(echo()).rejects.toThrow("GraphQL response contained no data");
  });

  it("propagates a network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(echo()).rejects.toThrow("Failed to fetch");
  });

  it("passes the signal to fetch and propagates an abort", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("The operation was aborted.", "AbortError")),
          );
        }),
    );
    const controller = new AbortController();

    const pending = echo(controller.signal);
    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchSpy.mock.calls[0][1]?.signal).toBe(controller.signal);
  });
});

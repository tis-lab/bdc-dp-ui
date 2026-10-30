import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useConceptSuggestions } from "./useConceptSuggestions";
import {
  AUTOCOMPLETE_QUERY,
  type SuggestionsPage,
} from "../api/graphql/queries/autocomplete";

const ENDPOINT = "https://graphql.test/graphql";

const suggestionsPage: SuggestionsPage = {
  items: [
    {
      id: "HP:0000822",
      label: "Hypertension",
      category: "biolink:PhenotypicFeature",
      displayLabel: "Hypertension",
      description: "The presence of chronic increased pressure in the systemic arterial system.",
    },
    {
      id: "MONDO:0005149",
      label: "pulmonary hypertension",
      category: "biolink:Disease",
      displayLabel: "pulmonary hypertension",
      description: null,
    },
  ],
  total: 2,
};

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

function wrapper({ children }: { children: ReactNode }) {
  return createWrapper().wrapper({ children });
}

function mockResponse(body: unknown) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));
}

describe("useConceptSuggestions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv("VITE_GRAPHQL_URL", ENDPOINT);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not run for empty or blank search text", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const { result: empty } = renderHook(() => useConceptSuggestions(""), { wrapper });
    const { result: blank } = renderHook(() => useConceptSuggestions("   "), { wrapper });

    expect(empty.current.fetchStatus).toBe("idle");
    expect(blank.current.fetchStatus).toBe("idle");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends Autocomplete with the trimmed search text", async () => {
    const fetchSpy = mockResponse({ data: { autocomplete: suggestionsPage } });

    const { result } = renderHook(() => useConceptSuggestions("  hyper "), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    expect(JSON.parse(init?.body as string)).toEqual({
      query: AUTOCOMPLETE_QUERY,
      variables: { query: "hyper" },
    });
  });

  it("requests only suggestion items, not BDC variables or coverage", () => {
    expect(AUTOCOMPLETE_QUERY).toContain("items");
    expect(AUTOCOMPLETE_QUERY).not.toContain("bdcVariables");
    expect(AUTOCOMPLETE_QUERY).not.toContain("bdc {");
  });

  it("keys the query on the trimmed search text", async () => {
    mockResponse({ data: { autocomplete: suggestionsPage } });
    const { client, wrapper } = createWrapper();

    const { result } = renderHook(() => useConceptSuggestions("  hyper "), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const keys = client.getQueryCache().getAll().map((q) => q.queryKey);
    expect(keys).toEqual([["autocomplete", "hyper"]]);
  });

  it("returns the page of suggestions", async () => {
    mockResponse({ data: { autocomplete: suggestionsPage } });

    const { result } = renderHook(() => useConceptSuggestions("hyper"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(suggestionsPage);
  });

  it("passes TanStack Query's abort signal to the request", async () => {
    const fetchSpy = mockResponse({ data: { autocomplete: suggestionsPage } });

    const { result } = renderHook(() => useConceptSuggestions("hyper"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchSpy.mock.calls[0][1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it("surfaces GraphQL errors", async () => {
    mockResponse({ data: null, errors: [{ message: "query must not be blank" }] });

    const { result } = renderHook(() => useConceptSuggestions("hyper"), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe("query must not be blank");
  });

  it.each([
    ["autocomplete is null", { data: { autocomplete: null } }],
    ["data is null", { data: null }],
  ])("fails with 'Missing autocomplete response' when %s", async (_case, body) => {
    mockResponse(body);

    const { result } = renderHook(() => useConceptSuggestions("hyper"), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe("Missing autocomplete response");
  });

  it("fails without a request when VITE_GRAPHQL_URL is not set", async () => {
    vi.stubEnv("VITE_GRAPHQL_URL", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const { result } = renderHook(() => useConceptSuggestions("hyper"), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe("VITE_GRAPHQL_URL is not set");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

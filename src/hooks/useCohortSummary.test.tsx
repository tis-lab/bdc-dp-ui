import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useCohortSummary, type Criteria } from "./useCohortSummary";
import { t2dSummary } from "../mocks/SYNTHETIC.cohortSummary";
import { COHORT_SUMMARY_QUERY } from "../api/graphql/queries/cohortSummary";
import type { SearchItem } from "../api/graphql/queries/resolveTerms";

const ENDPOINT = "https://graphql.test/graphql";

const term = (id: string): SearchItem => ({
  __typename: "Term",
  id,
  label: id,
  category: "biolink:Disease",
  description: null,
  synonyms: null,
  bdc: { studyCount: 0, studies: [], variableNames: [] },
});

const none: Criteria = { include: [], exclude: [], match: "all" };
const t2d: Criteria = {
  include: [term("MONDO:0005148")],
  exclude: [],
  match: "all",
};

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function mockResponse(body: unknown) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(
      async () => new Response(JSON.stringify(body), { status: 200 }),
    );
}

const sentBody = (fetchSpy: ReturnType<typeof mockResponse>, call = 0) =>
  JSON.parse(fetchSpy.mock.calls[call][1]?.body as string);

describe("useCohortSummary", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv("VITE_GRAPHQL_URL", ENDPOINT);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not run without criteria", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { result } = renderHook(() => useCohortSummary(none), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends the summary query for the t2d source", async () => {
    const fetchSpy = mockResponse({ data: { summary: t2dSummary } });

    const { result } = renderHook(() => useCohortSummary(t2d), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    expect(sentBody(fetchSpy)).toEqual({
      query: COHORT_SUMMARY_QUERY,
      variables: { sourceId: "t2d", include: ["MONDO:0005148"], exclude: [] },
    });
  });

  it("sends included and excluded concept IDs", async () => {
    const fetchSpy = mockResponse({ data: { summary: t2dSummary } });

    const { result } = renderHook(
      () =>
        useCohortSummary({
          include: [term("MONDO:0005267"), term("MONDO:0005148")],
          exclude: [term("MONDO:0005252")],
          match: "all",
        }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(sentBody(fetchSpy).variables).toEqual({
      sourceId: "t2d",
      include: ["MONDO:0005148", "MONDO:0005267"],
      exclude: ["MONDO:0005252"],
    });
  });

  it("returns the response with placeholder study counts for the selection", async () => {
    mockResponse({ data: { summary: t2dSummary } });

    const { result } = renderHook(() => useCohortSummary(t2d), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // 480 + 460 from the API, moved to 990 for one include
    expect(
      result.current.data?.studies.map((s) => s.participant_count),
    ).toEqual([506, 484]);
    expect(result.current.data?.studies[0].demographics).toEqual(
      t2dSummary.studies[0].demographics,
    );
  });

  it("surfaces GraphQL errors, such as a concept the source doesn't support", async () => {
    mockResponse({
      data: { summary: null },
      errors: [
        {
          message:
            "The selected concept is not supported by this summary source.",
        },
      ],
    });

    const { result } = renderHook(() => useCohortSummary(t2d), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe(
      "The selected concept is not supported by this summary source.",
    );
  });

  it("keeps the previous summary while the next one loads", async () => {
    mockResponse({ data: { summary: t2dSummary } });
    const { result, rerender } = renderHook(
      ({ criteria }) => useCohortSummary(criteria),
      { wrapper, initialProps: { criteria: t2d } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const previous = result.current.data;

    rerender({ criteria: { ...t2d, exclude: [term("MONDO:0005252")] } });

    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data).toEqual(previous);
  });

  it("asks again when AND/OR changes, though the API can't take it yet", async () => {
    const fetchSpy = mockResponse({ data: { summary: t2dSummary } });
    const { result, rerender } = renderHook(
      ({ criteria }) => useCohortSummary(criteria),
      { wrapper, initialProps: { criteria: t2d } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ criteria: { ...t2d, match: "any" } });

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    expect(sentBody(fetchSpy, 1).variables).not.toHaveProperty("match");
  });

  it("keeps nothing once every criterion is removed", async () => {
    mockResponse({ data: { summary: t2dSummary } });
    const { result, rerender } = renderHook(
      ({ criteria }) => useCohortSummary(criteria),
      { wrapper, initialProps: { criteria: t2d } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ criteria: none });

    expect(result.current.data).toBeUndefined();
  });
});

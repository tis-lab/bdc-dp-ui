import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  summaryFilter,
  useCohortSummary,
  type Criteria,
} from "./useCohortSummary";
import { t2dSummary } from "../mocks/SYNTHETIC.cohortSummary";
import { COHORT_SUMMARY_QUERY } from "../api/graphql/queries/cohortSummary";
import type { SearchItem } from "../api/graphql/queries/resolveTerms";

const ENDPOINT = "https://graphql.test/graphql";
const ORIGINAL_ENV = process.env;

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

const include = (concept: string) => ({
  condition: { concept, selection: "INCLUDE" },
});
const exclude = (concept: string) => ({
  condition: { concept, selection: "EXCLUDE" },
});

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const mockResponse = (body: unknown) =>
  jest
    .spyOn(globalThis, "fetch")
    .mockImplementation(
      async () => new Response(JSON.stringify(body), { status: 200 }),
    );

const sentBody = (fetchSpy: ReturnType<typeof mockResponse>, call = 0) =>
  JSON.parse(fetchSpy.mock.calls[call][1]?.body as string);

describe("summaryFilter", () => {
  it("is null with nothing selected", () => {
    expect(summaryFilter([], [], "all")).toBeNull();
  });

  it("sends one concept as a single condition, without a group", () => {
    expect(summaryFilter(["A"], [], "all")).toEqual(include("A"));
    expect(summaryFilter([], ["C"], "all")).toEqual(exclude("C"));
  });

  it("combines includes with AND or OR", () => {
    expect(summaryFilter(["A", "B"], [], "all")).toEqual({
      and: [include("A"), include("B")],
    });
    expect(summaryFilter(["A", "B"], [], "any")).toEqual({
      or: [include("A"), include("B")],
    });
  });

  it("requires every exclude alongside the includes", () => {
    expect(summaryFilter(["A", "B"], ["C", "D"], "any")).toEqual({
      and: [{ or: [include("A"), include("B")] }, exclude("C"), exclude("D")],
    });
    expect(summaryFilter(["A"], ["C"], "any")).toEqual({
      and: [include("A"), exclude("C")],
    });
  });
});

describe("useCohortSummary", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    process.env = { ...ORIGINAL_ENV, VITE_GRAPHQL_URL: ENDPOINT };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("does not run without criteria", () => {
    const fetchSpy = jest.spyOn(globalThis, "fetch");
    const { result } = renderHook(() => useCohortSummary(none), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends the summary query with an include filter, and returns the summary", async () => {
    const fetchSpy = mockResponse({ data: { summary: t2dSummary } });

    const { result } = renderHook(() => useCohortSummary(t2d), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [url] = fetchSpy.mock.calls[0];
    expect(url).toBe(ENDPOINT);
    expect(sentBody(fetchSpy)).toEqual({
      query: COHORT_SUMMARY_QUERY,
      variables: { filter: include("MONDO:0005148") },
    });
    expect(result.current.data).toEqual(t2dSummary);
  });

  it("sends a BDC concept's code", async () => {
    const fetchSpy = mockResponse({ data: { summary: t2dSummary } });

    const { result } = renderHook(
      () =>
        useCohortSummary({
          include: [
            {
              __typename: "BdcConcept",
              conceptType: "MONDO:0005044",
              displayLabel: "Hypertension",
              bdchmType: "condition",
              studyCount: 10,
              studies: [],
            },
          ],
          exclude: [],
          match: "all",
        }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(sentBody(fetchSpy).variables.filter).toEqual(
      include("MONDO:0005044"),
    );
  });

  it("sends included and excluded concepts in a stable order", async () => {
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

    expect(sentBody(fetchSpy).variables.filter).toEqual({
      and: [
        { and: [include("MONDO:0005148"), include("MONDO:0005267")] },
        exclude("MONDO:0005252"),
      ],
    });
  });

  it("surfaces GraphQL errors, such as a concept the API can't filter on", async () => {
    mockResponse({
      data: { summary: null },
      errors: [{ message: "Invalid concept CURIE: ATC:C02" }],
    });

    const { result } = renderHook(() => useCohortSummary(t2d), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe(
      "Invalid concept CURIE: ATC:C02",
    );
  });

  it("fails rather than showing zero when the summary is null", async () => {
    mockResponse({ data: { summary: null } });

    const { result } = renderHook(() => useCohortSummary(t2d), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe("Missing summary response");
  });

  it("is loading again, without the previous summary, for a new selection", async () => {
    mockResponse({ data: { summary: t2dSummary } });
    const { result, rerender } = renderHook(
      ({ criteria }) => useCohortSummary(criteria),
      { wrapper, initialProps: { criteria: t2d } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ criteria: { ...t2d, exclude: [term("MONDO:0005252")] } });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it("asks again with OR when AND/OR changes", async () => {
    const fetchSpy = mockResponse({ data: { summary: t2dSummary } });
    const two: Criteria = {
      include: [term("MONDO:0005148"), term("HP:0000822")],
      exclude: [],
      match: "all",
    };
    const { result, rerender } = renderHook(
      ({ criteria }) => useCohortSummary(criteria),
      { wrapper, initialProps: { criteria: two } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ criteria: { ...two, match: "any" } });

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    expect(sentBody(fetchSpy, 1).variables.filter).toEqual({
      or: [include("HP:0000822"), include("MONDO:0005148")],
    });
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

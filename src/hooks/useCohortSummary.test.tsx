import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCohortSummary, type Criteria } from "./useCohortSummary";
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

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

/** Answers searchConditions with 82 and everything else with `body`. */
const mockResponse = (body: unknown) =>
  jest.spyOn(globalThis, "fetch").mockImplementation(async (_, init) => {
    const reply = String(init?.body).includes("searchConditions")
      ? { data: { searchConditions: { totalHits: "82" } } }
      : body;
    return new Response(JSON.stringify(reply), { status: 200 });
  });

const sentBody = (fetchSpy: ReturnType<typeof mockResponse>, call = 0) =>
  JSON.parse(fetchSpy.mock.calls[call][1]?.body as string);

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

    expect(sentBody(fetchSpy).variables.include).toEqual(["MONDO:0005044"]);
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

  it("counts one included concept from searchConditions", async () => {
    const fetchSpy = mockResponse({ data: { summary: t2dSummary } });

    const { result } = renderHook(() => useCohortSummary(t2d), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(sentBody(fetchSpy, 1).variables).toEqual({
      keyword: "PRESENT|ONESELF|MONDO:0005148",
    });
    // 82 spread across the API's 480 + 460
    expect(
      result.current.data?.studies.map((s) => s.participant_count),
    ).toEqual([42, 40]);
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

  it("asks again when AND/OR changes, though the API can't take it yet", async () => {
    const fetchSpy = mockResponse({ data: { summary: t2dSummary } });
    const { result, rerender } = renderHook(
      ({ criteria }) => useCohortSummary(criteria),
      { wrapper, initialProps: { criteria: t2d } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ criteria: { ...t2d, match: "any" } });

    // A summary and a searchConditions request per selection
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(4));
    expect(sentBody(fetchSpy, 2).variables).not.toHaveProperty("match");
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

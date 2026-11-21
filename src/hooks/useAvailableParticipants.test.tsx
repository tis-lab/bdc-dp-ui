import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { useAvailableParticipants } from "./useAvailableParticipants";
import { COHORT_SUMMARY_QUERY } from "../api/graphql/queries/cohortSummary";
import { createWrapper } from "../test/createWrapper";

let client: QueryClient;
let wrapper: ReturnType<typeof createWrapper>["wrapper"];
beforeEach(() => {
  ({ client, wrapper } = createWrapper());
});
afterEach(() => client.clear());

const mockResponse = (body: unknown) =>
  jest
    .spyOn(globalThis, "fetch")
    .mockImplementation(
      async () => new Response(JSON.stringify(body), { status: 200 }),
    );

const summaryOf = (...counts: number[]) => ({
  data: {
    summary: {
      studies: counts.map((participant_count, i) => ({
        research_study: `study_${i}`,
        participant_count,
      })),
    },
  },
});

describe("useAvailableParticipants", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("sends the unfiltered summary and returns the sum of study counts", async () => {
    const fetchSpy = mockResponse(summaryOf(1200, 1050));

    const { result } = renderHook(() => useAvailableParticipants(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(2250);
    expect(JSON.parse(fetchSpy.mock.calls[0][1]?.body as string)).toEqual({
      query: COHORT_SUMMARY_QUERY,
      variables: { filter: null },
    });
  });

  it("returns null, not 0, when there are no studies", async () => {
    mockResponse(summaryOf());

    const { result } = renderHook(() => useAvailableParticipants(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });

  it("returns null when the summary is missing", async () => {
    mockResponse({ data: { summary: null } });

    const { result } = renderHook(() => useAvailableParticipants(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });

  it("fails when the request fails", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("", { status: 500 }));

    const { result } = renderHook(() => useAvailableParticipants(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

import type { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAvailableParticipants } from "./useAvailableParticipants";
import { PAGE_LOAD_SNAPSHOT_QUERY } from "../api/graphql/queries/pageLoadSnapshot";

const ENDPOINT = "https://graphql.test/graphql";
const ORIGINAL_ENV = process.env;

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

const snapshot = (value: number | null, suppressed = false) => ({
  data: { pageLoadSnapshot: { participantCount: { value, suppressed } } },
});

describe("useAvailableParticipants", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    process.env = { ...ORIGINAL_ENV, VITE_GRAPHQL_URL: ENDPOINT };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("sends pageLoadSnapshot and returns its participant count", async () => {
    const fetchSpy = mockResponse(snapshot(1000));

    const { result } = renderHook(() => useAvailableParticipants(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBe(1000);
    expect(
      JSON.parse(fetchSpy.mock.calls[0][1]?.body as string),
    ).toEqual({ query: PAGE_LOAD_SNAPSHOT_QUERY, variables: {} });
  });

  it("returns null, not 0, when the count is suppressed", async () => {
    mockResponse(snapshot(null, true));

    const { result } = renderHook(() => useAvailableParticipants(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });

  it("returns null when the snapshot is missing", async () => {
    mockResponse({ data: { pageLoadSnapshot: null } });

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

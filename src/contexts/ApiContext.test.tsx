import type { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { ApiBaseUrlProvider, CbAccess, useQueryEndpoint } from "./ApiContext";

const withBase =
  (base: string) =>
  ({ children }: { children: ReactNode }) => (
    <ApiBaseUrlProvider value={base}>{children}</ApiBaseUrlProvider>
  );

describe("useQueryEndpoint", () => {
  it("throws when no host supplied apiBaseUrl", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useQueryEndpoint())).toThrow(
      "CohortBuilder: apiBaseUrl prop missing",
    );
  });

  it.each<[string, CbAccess, string]>([
    ["", "open", "/cb/open/query"], // standalone
    ["/api", "open", "/api/cb/open/query"], // framework
    ["/api/", "open", "/api/cb/open/query"], // trailing slash trimmed
    ["/api", "auth", "/api/cb/auth/query"],
  ])("base %j + %s → %s", (base, access, expected) => {
    const { result } = renderHook(() => useQueryEndpoint(access), {
      wrapper: withBase(base),
    });
    expect(result.current).toBe(expected);
  });
});

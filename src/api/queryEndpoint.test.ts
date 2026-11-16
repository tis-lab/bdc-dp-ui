import { getQueryEndpoint } from "./queryEndpoint";

describe("getQueryEndpoint", () => {
  it("defaults to the open endpoint", () => {
    expect(getQueryEndpoint()).toBe("/api/cb/open/query");
  });

  it.each([
    ["open", "/api/cb/open/query"],
    ["auth", "/api/cb/auth/query"],
  ] as const)("%s → %s", (access, expected) => {
    expect(getQueryEndpoint(access)).toBe(expected);
  });

  it.each(["open", "auth"] as const)(
    "%s stays on the page's own origin, so Apache can forward it",
    (access) => {
      const pageOrigin = "https://cohort-builder.example.org";
      expect(new URL(getQueryEndpoint(access), pageOrigin).origin).toBe(
        pageOrigin,
      );
    },
  );
});

import { shouldRetry } from "./queryClient";
import { HttpError } from "./graphql/graphqlRequest";

describe("shouldRetry", () => {
  it.each([
    ["a network failure", new TypeError("Failed to fetch")],
    ["a 5xx response", new HttpError(503)],
  ])("retries %s up to twice", (_, error) => {
    expect(shouldRetry(0, error)).toBe(true);
    expect(shouldRetry(1, error)).toBe(true);
    expect(shouldRetry(2, error)).toBe(false);
  });

  it.each([
    ["a 4xx response", new HttpError(400)],
    ["a GraphQL error", new Error("BAD_USER_INPUT")],
  ])("does not retry %s", (_, error) => {
    expect(shouldRetry(0, error)).toBe(false);
  });
});

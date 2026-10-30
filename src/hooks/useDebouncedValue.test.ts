import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "./useDebouncedValue";

// ----------------------------------------------------------------------

const DELAY = 300;

/** Renders the hook with `value` and `delayMs` as rerenderable props. */
function renderDebounced<T>(value: T, delayMs = DELAY) {
  return renderHook(
    ({ value, delayMs }: { value: T; delayMs: number }) =>
      useDebouncedValue(value, delayMs),
    { initialProps: { value, delayMs } },
  );
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ----------------------------------------------------------------------

describe("useDebouncedValue", () => {
  describe("initial value", () => {
    it("returns the initial value immediately", () => {
      const { result } = renderDebounced("a");
      expect(result.current).toBe("a");
    });

    it("keeps the initial value after the delay", () => {
      const { result } = renderDebounced("a");

      advance(DELAY);

      expect(result.current).toBe("a");
    });
  });

  describe("a single change", () => {
    it("keeps the old value until the delay has passed", () => {
      const { result, rerender } = renderDebounced("a");

      rerender({ value: "b", delayMs: DELAY });
      advance(DELAY - 1);

      expect(result.current).toBe("a");
    });

    it("returns the new value once the delay has passed", () => {
      const { result, rerender } = renderDebounced("a");

      rerender({ value: "b", delayMs: DELAY });
      advance(DELAY);

      expect(result.current).toBe("b");
    });
  });

  describe("rapid changes", () => {
    it("restarts the delay on every change", () => {
      const { result, rerender } = renderDebounced("a");

      rerender({ value: "b", delayMs: DELAY });
      advance(DELAY - 1);
      rerender({ value: "c", delayMs: DELAY });
      advance(DELAY - 1);

      // 598 ms since the first change, but only 299 ms since the last one
      expect(result.current).toBe("a");

      advance(1);
      expect(result.current).toBe("c");
    });

    it("never returns the intermediate values", () => {
      const seen: string[] = [];
      const { rerender } = renderHook(
        ({ value }: { value: string }) => {
          const debounced = useDebouncedValue(value, DELAY);
          seen.push(debounced);
          return debounced;
        },
        { initialProps: { value: "" } },
      );

      for (const value of ["a", "as", "ast", "asth"]) {
        rerender({ value });
        advance(100);
      }
      advance(DELAY);

      expect(new Set(seen)).toEqual(new Set(["", "asth"]));
    });

    it("settles on a value that changed and changed back", () => {
      const { result, rerender } = renderDebounced("a");

      rerender({ value: "b", delayMs: DELAY });
      advance(100);
      rerender({ value: "a", delayMs: DELAY });
      advance(DELAY);

      expect(result.current).toBe("a");
    });
  });

  describe("rerenders without a change", () => {
    it("does not restart the delay when the value is the same", () => {
      const { result, rerender } = renderDebounced("a");

      rerender({ value: "b", delayMs: DELAY });
      advance(200);
      rerender({ value: "b", delayMs: DELAY });
      advance(100);

      expect(result.current).toBe("b");
    });
  });

  describe("delay", () => {
    it("uses the given delay", () => {
      const { result, rerender } = renderDebounced("a", 1000);

      rerender({ value: "b", delayMs: 1000 });
      advance(999);
      expect(result.current).toBe("a");

      advance(1);
      expect(result.current).toBe("b");
    });

    it("restarts the timer when the delay changes", () => {
      const { result, rerender } = renderDebounced("a");

      rerender({ value: "b", delayMs: DELAY });
      advance(200);
      rerender({ value: "b", delayMs: 500 });
      advance(499);

      expect(result.current).toBe("a");

      advance(1);
      expect(result.current).toBe("b");
    });

    it("updates on the next tick with a delay of 0", () => {
      const { result, rerender } = renderDebounced("a", 0);

      rerender({ value: "b", delayMs: 0 });
      expect(result.current).toBe("a");

      advance(0);
      expect(result.current).toBe("b");
    });
  });

  describe("cleanup", () => {
    it("clears the pending timer on unmount", () => {
      const { rerender, unmount } = renderDebounced("a");
      rerender({ value: "b", delayMs: DELAY });
      expect(vi.getTimerCount()).toBe(1);

      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });

    it("keeps at most one pending timer", () => {
      const { rerender } = renderDebounced("a");

      for (const value of ["b", "c", "d"]) {
        rerender({ value, delayMs: DELAY });
      }

      expect(vi.getTimerCount()).toBe(1);
    });
  });

  describe("value types", () => {
    it("returns the latest object by reference", () => {
      const first = { query: "a" };
      const second = { query: "b" };
      const { result, rerender } = renderDebounced(first);

      rerender({ value: second, delayMs: DELAY });
      advance(DELAY);

      expect(result.current).toBe(second);
    });

    it("debounces falsy values like any other", () => {
      const { result, rerender } = renderDebounced<string | null>("a");

      rerender({ value: null, delayMs: DELAY });
      advance(DELAY - 1);
      expect(result.current).toBe("a");

      advance(1);
      expect(result.current).toBeNull();
    });
  });
});

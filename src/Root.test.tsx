import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CohortBuilder } from "./index";

describe("CohortBuilder (package export)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the app inside its providers", () => {
    render(<CohortBuilder />);

    expect(screen.getByText("Study Palette")).toBeInTheDocument();
  });
});

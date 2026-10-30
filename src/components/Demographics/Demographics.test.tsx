import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import Demographics from "./Demographics";
import { t2dFemaleSummary, t2dSummary } from "../../mocks/SYNTHETIC.cohortSummary";

// test-setup.ts stubs ECharts to list each bar as "name: value"

describe("Demographics", () => {
  it("prompts for criteria, with no tabs, before there is a cohort", () => {
    render(<Demographics />);

    expect(screen.getByText("Include a concept to see its demographic breakdown.")).toBeInTheDocument();
    expect(screen.queryByRole("tab")).toBeNull();
  });

  it("shows skeleton bars, not the prompt, on the first load", () => {
    render(<Demographics isLoading />);

    expect(
      screen.getByRole("progressbar", { name: "Loading demographics" }),
    ).toBeInTheDocument();
  });

  it("shows an error, not the counts, when the request fails", () => {
    render(<Demographics summary={t2dSummary} error={new Error("Network down")} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Couldn't load demographics.");
    expect(screen.queryByText("940 participants · 2 studies")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
  });

  it("is a labelled panel with the cohort size and study count", () => {
    render(<Demographics summary={t2dSummary} />);

    expect(
      screen.getByRole("region", { name: "Demographics" }),
    ).toBeInTheDocument();
    expect(screen.getByText("940 participants · 2 studies")).toBeInTheDocument();
  });

  it("shows sex by default", () => {
    render(<Demographics summary={t2dSummary} />);

    expect(screen.getByRole("tab", { name: "Sex" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Female: 480")).toBeInTheDocument();
    expect(screen.getByText("Male: 450")).toBeInTheDocument();
    expect(screen.getByText("Not reported: 10")).toBeInTheDocument();
  });

  it("switches to race and ethnicity", async () => {
    const user = userEvent.setup();
    render(<Demographics summary={t2dSummary} />);

    await user.click(screen.getByRole("tab", { name: "Race" }));
    expect(screen.getByText("White: 510")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Ethnicity" }));
    expect(screen.getByText("Hispanic or Latino: 140")).toBeInTheDocument();
  });

  it("says so when the cohort has no data for a breakdown", async () => {
    const user = userEvent.setup();
    render(<Demographics summary={t2dFemaleSummary} />);

    await user.click(screen.getByRole("tab", { name: "Ethnicity" }));

    expect(screen.getByText("Not reported for this cohort.")).toBeInTheDocument();
  });
});

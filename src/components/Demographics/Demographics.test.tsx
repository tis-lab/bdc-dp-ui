import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Demographics from "./Demographics";
import { SUMMED_TOTALS_NOTE } from "../../utils/summary";
import {
  t2dFemaleSummary,
  t2dSummary,
} from "../../mocks/SYNTHETIC.cohortSummary";

// jest.config.js maps echarts-for-react to src/test/echartsStub.tsx,
// which lists each bar as "name: value"

const SUPPRESSED_SEX = "Other (fewer than 10 per study, not shown)";

describe("Demographics", () => {
  it("prompts for criteria, with no tabs, before there is a cohort", () => {
    render(<Demographics />);

    expect(
      screen.getByText("Include a concept to see its demographic breakdown."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("tab")).toBeNull();
  });

  it("shows skeleton bars, not the prompt, on the first load", () => {
    render(<Demographics isLoading />);

    expect(
      screen.getByRole("progressbar", { name: "Loading demographics" }),
    ).toBeInTheDocument();
  });

  it("shows an error, not the counts, when the request fails", () => {
    render(
      <Demographics
        filteredSummary={t2dSummary}
        error={new Error("Network down")}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't load demographics.",
    );
    expect(screen.queryByText("940 participants · 2 studies")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
  });

  it("is a labelled panel with the cohort size and study count", () => {
    render(<Demographics filteredSummary={t2dSummary} />);

    expect(
      screen.getByRole("region", { name: "Demographics" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("940 participants · 2 studies"),
    ).toBeInTheDocument();
  });

  it("shows sex by default", () => {
    render(<Demographics filteredSummary={t2dSummary} />);

    expect(screen.getByRole("tab", { name: "Sex" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Female: 480")).toBeInTheDocument();
    expect(screen.getByText("Male: 450")).toBeInTheDocument();
  });

  it("lists suppressed sex values as text, never as a bar or a number", () => {
    render(<Demographics filteredSummary={t2dSummary} />);

    // Shown as a plain line, not a "name: value" bar.
    expect(screen.getByText(SUPPRESSED_SEX)).toBeInTheDocument();
    expect(screen.queryByText(`${SUPPRESSED_SEX}: null`)).toBeNull();
    // The hidden values are reported people, not missing ones, and their
    // total (10) must not be shown in any form.
    expect(screen.queryByText(/^Not reported/)).toBeNull();
    expect(screen.queryByText(/: (null|NaN|0)$/)).toBeNull();
  });

  it("charts not-reported race as a bar, since it has a real count", async () => {
    const user = userEvent.setup();
    render(<Demographics filteredSummary={t2dSummary} />);

    await user.click(screen.getByRole("tab", { name: "Race" }));

    expect(screen.getByText("Not reported: 15")).toBeInTheDocument();
    expect(screen.queryByText(/not shown/)).toBeNull();
  });

  it("switches to race and ethnicity", async () => {
    const user = userEvent.setup();
    render(<Demographics filteredSummary={t2dSummary} />);

    await user.click(screen.getByRole("tab", { name: "Race" }));
    expect(screen.getByText("White: 510")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Ethnicity" }));
    expect(screen.getByText("Hispanic or Latino: 140")).toBeInTheDocument();
  });

  it("says so when the cohort has no data for a breakdown", async () => {
    const user = userEvent.setup();
    render(<Demographics filteredSummary={t2dFemaleSummary} />);

    await user.click(screen.getByRole("tab", { name: "Ethnicity" }));

    expect(
      screen.getByText("Not reported for this cohort."),
    ).toBeInTheDocument();
  });

  it("shows the summed totals note with the breakdown", () => {
    render(<Demographics filteredSummary={t2dSummary} />);

    expect(
      screen.getByText(SUMMED_TOTALS_NOTE, { exact: false }),
    ).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import CohortSnapshot from "./CohortSnapshot";
import { SUMMED_TOTALS_NOTE } from "../../utils/summary";
import {
  t2dFemaleSummary,
  t2dSummary,
} from "../../mocks/SYNTHETIC.cohortSummary";

// jest.config.js maps echarts-for-react to src/test/echartsStub.tsx,
// which lists each slice as "name: value"

const AVAILABLE = 5000;

describe("CohortSnapshot", () => {
  it("is a labelled panel with its subtitle", () => {
    render(
      <CohortSnapshot
        filteredSummary={t2dSummary}
        availableTotal={AVAILABLE}
      />,
    );

    expect(
      screen.getByRole("region", { name: "Cohort Snapshot" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Based on current cohort")).toBeInTheDocument();
  });

  it("shows everyone available, with a full ring, before there is a summary", () => {
    render(<CohortSnapshot availableTotal={AVAILABLE} />);

    expect(screen.getByText("5,000")).toBeInTheDocument();
    expect(screen.getByText("In cohort: 5000")).toBeInTheDocument();
    expect(screen.getByText("Not in cohort: 0")).toBeInTheDocument();
    expect(screen.queryByText("Studies:")).toBeNull();
    expect(screen.queryByText(/available/)).toBeNull();
    expect(screen.queryByText("Based on current cohort")).toBeNull();
  });

  it("shows an error instead of the counts when the request fails", () => {
    render(
      <CohortSnapshot
        availableTotal={AVAILABLE}
        error={new Error("Network down")}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Couldn't load the cohort snapshot.",
    );
    expect(screen.queryByText("5,000")).toBeNull();
  });

  it("shows a skeleton ring instead of the counts on the first load", () => {
    render(<CohortSnapshot availableTotal={AVAILABLE} isLoading />);

    expect(
      screen.getByRole("progressbar", { name: "Loading cohort snapshot" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Cohort Snapshot" }),
    ).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("5,000")).toBeNull();
  });

  it("shows the participants summed across studies, out of those available", () => {
    render(
      <CohortSnapshot
        filteredSummary={t2dSummary}
        availableTotal={AVAILABLE}
      />,
    );

    // 480 + 460
    expect(screen.getByText("940")).toBeInTheDocument();
    expect(screen.getByText("Estimated Participants")).toBeInTheDocument();
    expect(screen.getByText("of 5,000 available")).toBeInTheDocument();
  });

  it("draws the cohort against the rest of those available", () => {
    render(
      <CohortSnapshot
        filteredSummary={t2dSummary}
        availableTotal={AVAILABLE}
      />,
    );

    expect(screen.getByText("In cohort: 940")).toBeInTheDocument();
    expect(screen.getByText("Not in cohort: 4060")).toBeInTheDocument();
  });

  it("shows the number of studies in the response", () => {
    render(
      <CohortSnapshot
        filteredSummary={t2dSummary}
        availableTotal={AVAILABLE}
      />,
    );

    expect(screen.getByText("Studies:").textContent).toBe("Studies: 2");
  });

  it("notes that the count is an estimate", () => {
    render(
      <CohortSnapshot
        filteredSummary={t2dSummary}
        availableTotal={AVAILABLE}
      />,
    );

    expect(
      screen.getByText(
        "Participant count is estimated until query is executed",
      ),
    ).toBeInTheDocument();
  });

  it("shows the summed totals note only with a summary", () => {
    const { rerender } = render(<CohortSnapshot availableTotal={AVAILABLE} />);
    expect(screen.queryByText(SUMMED_TOTALS_NOTE)).toBeNull();

    rerender(
      <CohortSnapshot
        filteredSummary={t2dSummary}
        availableTotal={AVAILABLE}
      />,
    );
    expect(screen.getByText(SUMMED_TOTALS_NOTE)).toBeInTheDocument();
  });

  it("updates when the summary narrows", () => {
    const { rerender } = render(
      <CohortSnapshot
        filteredSummary={t2dSummary}
        availableTotal={AVAILABLE}
      />,
    );

    rerender(
      <CohortSnapshot
        filteredSummary={t2dFemaleSummary}
        availableTotal={AVAILABLE}
      />,
    );

    // 230 + 250
    expect(screen.getByText("480")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import App from "./App";

// CohortBuilder has its own tests; this stub keeps App's test free of
// React Query, fetch and ECharts.
jest.mock("./containers/CohortBuilder", () => ({
  __esModule: true,
  default: () => <div data-testid="cohort-builder" />,
}));

describe("App", () => {
  it("renders the cohort builder", () => {
    render(<App />);

    expect(screen.getByTestId("cohort-builder")).toBeInTheDocument();
  });

  it("places it in a large-width MUI container", () => {
    render(<App />);

    const container = screen.getByTestId("cohort-builder").parentElement;
    expect(container).toHaveClass(
      "MuiContainer-root",
      "MuiContainer-maxWidthLg",
    );
  });
});

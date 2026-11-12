import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import App from "./App";

// Each page has its own tests; these stubs keep App's test about routing only,
// free of React Query, fetch and ECharts.
jest.mock("./containers/CohortBuilder", () => ({
  __esModule: true,
  default: () => <div data-testid="cohort-builder" />,
}));

jest.mock("./containers/Landing", () => ({
  __esModule: true,
  default: () => <div data-testid="landing" />,
}));

// App on its own, as if mounted at the root.
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

// App mounted the way the host framework does it, under a splat route.
function renderInHostAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/cohort-builder/*" element={<App />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("App", () => {
  it("renders the landing page at the index route", () => {
    renderAt("/");

    expect(screen.getByTestId("landing")).toBeInTheDocument();
    expect(screen.queryByTestId("cohort-builder")).not.toBeInTheDocument();
  });

  it("renders the cohort builder at /build", () => {
    renderAt("/build");

    expect(screen.getByTestId("cohort-builder")).toBeInTheDocument();
    expect(screen.queryByTestId("landing")).not.toBeInTheDocument();
  });

  describe("when mounted by the host at /cohort-builder/*", () => {
    it("renders the landing page at /cohort-builder", () => {
      renderInHostAt("/cohort-builder");

      expect(screen.getByTestId("landing")).toBeInTheDocument();
    });

    it("renders the cohort builder at /cohort-builder/build", () => {
      renderInHostAt("/cohort-builder/build");

      expect(screen.getByTestId("cohort-builder")).toBeInTheDocument();
    });
  });
});

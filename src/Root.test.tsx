import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Root from "./Root";
import { queryClient } from "./api/queryClient";

// Root's own QueryClient is shared module state, so clear its cache between
// tests to keep them independent of each other's order.
afterEach(() => {
  queryClient.clear();
});

describe("Root", () => {
  // No QueryClientProvider here on purpose: Root must supply its own, so a host
  // application doesn't have to. Without one, render throws "No QueryClient set".
  //
  // The router, on the other hand, is supplied by the host on purpose: Root
  // cannot render one inside the host's BrowserRouter. MemoryRouter stands in
  // for the host here.
  it("renders the cohort builder inside its providers at /build", () => {
    render(
      <MemoryRouter initialEntries={["/build"]}>
        <Root />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("combobox", { name: "Search" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Cohort Criteria" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Cohort Snapshot" }),
    ).toBeInTheDocument();
  });
});

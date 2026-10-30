import { render, screen } from "@testing-library/react";
import Root from "./Root";

describe("Root", () => {
  // No QueryClientProvider here on purpose: Root must supply its own, so a host
  // application doesn't have to. Without one, render throws "No QueryClient set".
  it("renders the app inside its providers", () => {
    render(<Root />);

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

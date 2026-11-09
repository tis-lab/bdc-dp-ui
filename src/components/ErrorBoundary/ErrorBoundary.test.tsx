import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "./ErrorBoundary";

let shouldThrow = true;

function Flaky() {
  if (shouldThrow) throw new Error("Chart failed");
  return <p>Recovered</p>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    shouldThrow = true;
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders children when nothing throws", () => {
    shouldThrow = false;
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Recovered")).toBeInTheDocument();
  });

  it("shows a generic message, not the raw error", () => {
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Something went wrong.",
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent("Chart failed");
  });

  it("renders the children again on Try again", async () => {
    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>,
    );

    shouldThrow = false;
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("Recovered")).toBeInTheDocument();
  });
});

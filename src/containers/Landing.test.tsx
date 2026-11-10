import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ReactElement } from "react";
import Landing from "./Landing";

// Landing.styles uses theme.palette.background.main (custom key).
// Prefer importing your real app theme here instead of this stand-in.
const theme = createTheme({
  palette: {
    background: { main: "#f5f5f5" },
  },
} as Parameters<typeof createTheme>[0]);

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe("Landing", () => {
  describe("hero", () => {
    it("renders a single h1 with the page title", () => {
      renderWithTheme(<Landing />);
      const h1s = screen.getAllByRole("heading", { level: 1 });
      expect(h1s).toHaveLength(1);
      expect(h1s[0]).toHaveTextContent("Welcome to Cohort Builder");
    });

    it("renders the BioData Catalyst description", () => {
      renderWithTheme(<Landing />);
      expect(
        screen.getByText(
          /BioData Catalyst connects researchers to NHLBI datasets/i,
        ),
      ).toBeInTheDocument();
    });

    it("renders an enabled Quick Tour button", () => {
      renderWithTheme(<Landing />);
      const button = screen.getByRole("button", { name: "Take a Quick Tour" });
      expect(button).toBeEnabled();
    });
  });

  describe("main section", () => {
    it("renders the h2 section heading and subtitle", () => {
      renderWithTheme(<Landing />);
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: "Start Building a Cohort",
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Search for concepts or start from an existing definition",
        ),
      ).toBeInTheDocument();
    });

    it("exposes the Search Concepts panel as a region named by its title", () => {
      renderWithTheme(<Landing />);
      const region = screen.getByRole("region", { name: "Search Concepts" });
      expect(region.tagName).toBe("SECTION");
      expect(
        within(region).getByText(
          "Find variables across BDC studies by keyword or ontology term",
        ),
      ).toBeInTheDocument();
    });

    it("exposes the Existing Cohort Definitions panel as a region named by its title", () => {
      renderWithTheme(<Landing />);
      const region = screen.getByRole("region", {
        name: "Existing Cohort Definitions",
      });
      expect(region.tagName).toBe("SECTION");
      // Matches the subtitle as written; stops before the last word so
      // fixing the "definiton" typo won't break this test.
      expect(
        within(region).getByText(/^Start from a curated community defini/),
      ).toBeInTheDocument();
    });

    it("points each aria-labelledby at an element that exists", () => {
      const { container } = renderWithTheme(<Landing />);
      const sections = container.querySelectorAll("section[aria-labelledby]");
      expect(sections).toHaveLength(2);
      sections.forEach((section) => {
        const id = section.getAttribute("aria-labelledby")!;
        expect(document.getElementById(id)).not.toBeNull();
      });
    });
  });

  describe("accessibility invariants", () => {
    it("produces no duplicate ids when rendered more than once", () => {
      const { container } = renderWithTheme(
        <>
          <Landing />
          <Landing />
        </>,
      );
      const ids = Array.from(container.querySelectorAll("[id]")).map(
        (el) => el.id,
      );
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});

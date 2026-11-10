import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import Landing from "./Landing";

// ----------------------------------------------------------------------

// ConceptSearchbar has its own tests. Landing only decides what a search
// does, so the stub exposes onSearch through buttons and shows the props.
// jest.mock factories may only use outside variables named mock*.
jest.mock("../components/ConceptSearchbar", () => ({
  __esModule: true,
  default: ({
    onSearch,
    placeholder,
    showExamples,
  }: {
    onSearch: (text: string) => void;
    placeholder?: string;
    showExamples?: boolean;
  }) => (
    <div
      data-testid="concept-searchbar"
      data-placeholder={placeholder}
      data-show-examples={String(!!showExamples)}
    >
      <button onClick={() => onSearch("  heart failure  ")}>
        search heart failure
      </button>
      <button onClick={() => onSearch("a&b c")}>
        search special characters
      </button>
      <button onClick={() => onSearch("   ")}>search blank</button>
    </div>
  ),
}));

// Landing.styles uses theme.palette.background.main (custom key).
// Prefer importing your real app theme here instead of this stand-in.
const theme = createTheme({
  palette: {
    background: { main: "#f5f5f5" },
  },
} as Parameters<typeof createTheme>[0]);

/** Stands in for the cohort builder route: shows the query it was opened with. */
function BuilderProbe() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <div data-testid="builder">{location.search}</div>
      <button onClick={() => navigate(-1)}>History back</button>
    </>
  );
}

function renderApp(ui: ReactNode = <Landing />) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={ui} />
          <Route path="/build" element={<BuilderProbe />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

/** The query string the builder was opened with, parsed. */
const builderParams = () =>
  new URLSearchParams(screen.getByTestId("builder").textContent ?? "");

// ----------------------------------------------------------------------

describe("Landing", () => {
  describe("hero", () => {
    it("renders a single h1 with the page title", () => {
      renderApp();
      const h1s = screen.getAllByRole("heading", { level: 1 });
      expect(h1s).toHaveLength(1);
      expect(h1s[0]).toHaveTextContent("Welcome to Cohort Builder");
    });

    it("renders the BioData Catalyst description", () => {
      renderApp();
      expect(
        screen.getByText(
          /BioData Catalyst connects researchers to NHLBI datasets/i,
        ),
      ).toBeInTheDocument();
    });

    it("renders an enabled Quick Tour button", () => {
      renderApp();
      const button = screen.getByRole("button", { name: "Take a Quick Tour" });
      expect(button).toBeEnabled();
    });
  });

  describe("main section", () => {
    it("renders the h2 section heading and subtitle", () => {
      renderApp();
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
      renderApp();
      const region = screen.getByRole("region", { name: "Search Concepts" });
      expect(region.tagName).toBe("SECTION");
      expect(
        within(region).getByText(
          "Find variables across BDC studies by keyword or ontology term",
        ),
      ).toBeInTheDocument();
    });

    it("exposes the Existing Cohort Definitions panel as a region named by its title", () => {
      renderApp();
      const region = screen.getByRole("region", {
        name: "Existing Cohort Definitions",
      });
      expect(region.tagName).toBe("SECTION");
      expect(
        within(region).getByText("Start from a curated community definition"),
      ).toBeInTheDocument();
    });

    it("points each aria-labelledby at an element that exists", () => {
      const { container } = renderApp();
      const sections = container.querySelectorAll("section[aria-labelledby]");
      expect(sections).toHaveLength(2);
      sections.forEach((section) => {
        const id = section.getAttribute("aria-labelledby")!;
        expect(document.getElementById(id)).not.toBeNull();
      });
    });
  });

  describe("concept search", () => {
    it("shows the searchbar, with examples, in the Search Concepts panel", () => {
      renderApp();
      const region = screen.getByRole("region", { name: "Search Concepts" });
      const searchbar = within(region).getByTestId("concept-searchbar");
      expect(searchbar).toHaveAttribute("data-show-examples", "true");
      expect(searchbar).toHaveAttribute(
        "data-placeholder",
        "e.g. blood pressure, diabetes, BMI…",
      );
    });

    it("opens the cohort builder with the trimmed query", async () => {
      const user = userEvent.setup();
      renderApp();

      await user.click(
        screen.getByRole("button", { name: "search heart failure" }),
      );

      expect(builderParams().get("q")).toBe("heart failure");
      expect([...builderParams().keys()]).toEqual(["q"]);
    });

    it("keeps special characters in the query intact", async () => {
      const user = userEvent.setup();
      renderApp();

      await user.click(
        screen.getByRole("button", { name: "search special characters" }),
      );

      expect(builderParams().get("q")).toBe("a&b c");
      expect([...builderParams().keys()]).toEqual(["q"]);
    });

    it("opens the cohort builder without a query for blank text", async () => {
      const user = userEvent.setup();
      renderApp();

      await user.click(screen.getByRole("button", { name: "search blank" }));

      expect(screen.getByTestId("builder")).toBeEmptyDOMElement();
    });

    it("adds a history entry, so Back returns to the landing page", async () => {
      const user = userEvent.setup();
      renderApp();
      await user.click(
        screen.getByRole("button", { name: "search heart failure" }),
      );

      await user.click(screen.getByRole("button", { name: "History back" }));

      expect(
        screen.getByRole("heading", { name: "Welcome to Cohort Builder" }),
      ).toBeInTheDocument();
    });
  });

  describe("accessibility invariants", () => {
    it("produces no duplicate ids when rendered more than once", () => {
      const { container } = renderApp(
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

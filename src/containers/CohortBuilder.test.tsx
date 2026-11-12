import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CohortBuilder from "./CohortBuilder";
import type { SearchItem } from "../api/graphql/queries/resolveTerms";
import { t2dSummary } from "../mocks/SYNTHETIC.cohortSummary";
import type { SummaryResponse } from "../api/graphql/queries/cohortSummary";
import type { Criteria, CriteriaKind } from "../hooks/useCohortSummary";

const ORIGINAL_ENV = process.env;
const AVAILABLE = "2,000";

const studiesOf = (...counts: number[]): SummaryResponse => ({
  studies: counts.map((participant_count, i) => ({
    research_study: `study_${i}`,
    participant_count,
  })),
});

/** A fixed cohort per filter shape: AND, OR, or a single condition. */
const summaryFor = (filter: Record<string, unknown>) =>
  "and" in filter
    ? studiesOf(250, 200)
    : "or" in filter
      ? studiesOf(600, 600)
      : t2dSummary;

const pageLoadSnapshot = {
  participantCount: { value: 2000, suppressed: false },
};

const mockHypertension: SearchItem = {
  __typename: "Term",
  id: "HP:0000822",
  label: "Hypertension",
  category: "biolink:PhenotypicFeature",
  description: null,
  synonyms: null,
  bdc: { studyCount: 0, studies: [], variableNames: [] },
};

const mockDiabetes: SearchItem = {
  ...mockHypertension,
  id: "MONDO:0005148",
  label: "Diabetes",
};

const mockLabels = (items: SearchItem[]) =>
  items
    .map((i) => (i.__typename === "Term" ? i.label : i.displayLabel))
    .join(", ");

// ConceptSearch has its own tests; this stub reports clicks and shows the
// criteria it was given, the way its results mark what's already added.
// jest.mock factories may only use outside variables named mock*.
jest.mock("../components/ConceptSearch", () => ({
  __esModule: true,
  default: ({
    onInclude,
    onExclude,
    criteria,
    onRemove,
  }: {
    onInclude: (item: SearchItem) => void;
    onExclude: (item: SearchItem) => void;
    criteria: Criteria;
    onRemove: (kind: CriteriaKind) => (item: SearchItem) => void;
  }) => (
    <div>
      <button onClick={() => onInclude(mockHypertension)}>
        include result
      </button>
      <button onClick={() => onExclude(mockHypertension)}>
        exclude result
      </button>
      <button onClick={() => onInclude(mockDiabetes)}>
        include other result
      </button>
      <button onClick={() => onRemove("include")(mockHypertension)}>
        unmark included result
      </button>
      <p data-testid="search-included">{mockLabels(criteria.include)}</p>
      <p data-testid="search-excluded">{mockLabels(criteria.exclude)}</p>
    </div>
  ),
}));

beforeEach(() => {
  process.env = {
    ...ORIGINAL_ENV,
    VITE_GRAPHQL_URL: "https://graphql.test/graphql",
  };
  jest.spyOn(globalThis, "fetch").mockImplementation(async (_, init) => {
    const { query, variables } = JSON.parse(init?.body as string);
    const data = query.includes("pageLoadSnapshot")
      ? { pageLoadSnapshot }
      : { summary: summaryFor(variables.filter) };
    return new Response(JSON.stringify({ data }), { status: 200 });
  });
});

const sentBodies = () =>
  jest
    .mocked(globalThis.fetch)
    .mock.calls.map(([, init]) => JSON.parse(init?.body as string));

afterEach(() => {
  process.env = ORIGINAL_ENV;
  jest.restoreAllMocks();
});

const renderBuilder = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <CohortBuilder />
    </QueryClientProvider>,
  );
};

const querySection = (name: "Include" | "Exclude") =>
  screen.queryByRole("region", { name });

describe("CohortBuilder", () => {
  it("renders the search and the cohort snapshot", () => {
    renderBuilder();

    expect(
      screen.getByRole("button", { name: "include result" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Cohort Snapshot" }),
    ).toBeInTheDocument();
  });

  it("shows one empty state, without Include and Exclude, before anything is added", () => {
    renderBuilder();

    const criteria = screen.getByRole("region", { name: "Cohort Criteria" });
    expect(criteria).toHaveTextContent("0 criteria");
    expect(
      within(criteria).getByText("No criteria added yet"),
    ).toBeInTheDocument();
    expect(querySection("Include")).toBeNull();
    expect(querySection("Exclude")).toBeNull();
  });

  it("adds an included concept to the Include section only", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: "include result" }));

    expect(
      within(querySection("Include")!).getByText("Hypertension"),
    ).toBeInTheDocument();
    expect(
      within(querySection("Exclude")!).getByText("No exclusion criteria added"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Cohort Criteria" }),
    ).toHaveTextContent("1 criterion");
  });

  it("does not add the same concept twice", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: "include result" }));
    await user.click(screen.getByRole("button", { name: "include result" }));

    expect(
      within(querySection("Include")!).getAllByText("Hypertension"),
    ).toHaveLength(1);
  });

  it("moves a concept when it is excluded after being included", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: "include result" }));
    await user.click(screen.getByRole("button", { name: "exclude result" }));

    expect(
      within(querySection("Include")!).getByText("No inclusion criteria added"),
    ).toBeInTheDocument();
    expect(
      within(querySection("Exclude")!).getByText("Hypertension"),
    ).toBeInTheDocument();
  });

  it("removes a concept, showing the empty state again", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: "include result" }));
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(screen.getByText("No criteria added yet")).toBeInTheDocument();
    expect(querySection("Include")).toBeNull();
  });

  describe("wiring to ConceptSearch", () => {
    it("tells the search what is included and excluded", async () => {
      const user = userEvent.setup();
      renderBuilder();
      expect(screen.getByTestId("search-included")).toBeEmptyDOMElement();

      await user.click(screen.getByRole("button", { name: "include result" }));
      expect(screen.getByTestId("search-included")).toHaveTextContent(
        "Hypertension",
      );

      await user.click(screen.getByRole("button", { name: "exclude result" }));
      expect(screen.getByTestId("search-included")).toBeEmptyDOMElement();
      expect(screen.getByTestId("search-excluded")).toHaveTextContent(
        "Hypertension",
      );
    });

    it("removes a concept when it is unmarked in the search", async () => {
      const user = userEvent.setup();
      renderBuilder();

      await user.click(screen.getByRole("button", { name: "include result" }));
      await user.click(
        screen.getByRole("button", { name: "unmark included result" }),
      );

      expect(screen.getByText("No criteria added yet")).toBeInTheDocument();
      expect(screen.getByTestId("search-included")).toBeEmptyDOMElement();
    });
  });

  describe("cohort overview", () => {
    it("asks only for the page load snapshot on page load, and shows its total", async () => {
      renderBuilder();

      expect(await screen.findByText(AVAILABLE)).toBeInTheDocument();
      expect(
        screen.getByText("Include a concept to see its demographic breakdown."),
      ).toBeInTheDocument();
      expect(sentBodies()).toHaveLength(1);
      expect(sentBodies()[0].query).toContain("pageLoadSnapshot");
    });

    it("shows an error instead of the counts when the page load request fails", async () => {
      jest
        .mocked(globalThis.fetch)
        .mockImplementation(async () => new Response("", { status: 500 }));
      renderBuilder();

      expect(
        await screen.findByText("Couldn't load the cohort snapshot."),
      ).toBeInTheDocument();
    });

    it("shows the API's summary once a concept is included", async () => {
      const user = userEvent.setup();
      renderBuilder();

      await user.click(screen.getByRole("button", { name: "include result" }));

      // Sum of study counts: 480 + 460
      expect(await screen.findByText("940")).toBeInTheDocument();
      expect(screen.getByText(`of ${AVAILABLE} available`)).toBeInTheDocument();
      expect(
        screen.getByText("940 participants · 2 studies"),
      ).toBeInTheDocument();
      expect(sentBodies().at(-1).variables).toEqual({
        filter: { condition: { concept: "HP:0000822", selection: "INCLUDE" } },
      });
    });

    it("sends an exclude as an EXCLUDE condition", async () => {
      const user = userEvent.setup();
      renderBuilder();

      await user.click(screen.getByRole("button", { name: "exclude result" }));

      expect(await screen.findByText("940")).toBeInTheDocument();
      expect(sentBodies().at(-1).variables).toEqual({
        filter: { condition: { concept: "HP:0000822", selection: "EXCLUDE" } },
      });
    });

    it("offers AND/OR once two concepts are included, and the count follows it", async () => {
      const user = userEvent.setup();
      renderBuilder();

      await user.click(screen.getByRole("button", { name: "include result" }));
      await screen.findByText("940");
      expect(
        screen.queryByRole("group", { name: "Inclusion logic" }),
      ).toBeNull();

      await user.click(
        screen.getByRole("button", { name: "include other result" }),
      );
      const match = screen.getByRole("group", { name: "Inclusion logic" });
      expect(
        within(match).getByRole("button", { name: "All" }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(await screen.findByText("450")).toBeInTheDocument();
      expect(sentBodies().at(-1).variables.filter).toHaveProperty("and");

      await user.click(within(match).getByRole("button", { name: "Any" }));
      expect(await screen.findByText("1,200")).toBeInTheDocument();
      expect(sentBodies().at(-1).variables.filter).toHaveProperty("or");
    });

    it("goes back to everyone available once every criterion is removed", async () => {
      const user = userEvent.setup();
      renderBuilder();

      await user.click(screen.getByRole("button", { name: "include result" }));
      await screen.findByText("940");
      await user.click(screen.getByRole("button", { name: "Remove" }));

      expect(await screen.findByText(AVAILABLE)).toBeInTheDocument();
    });
  });
});

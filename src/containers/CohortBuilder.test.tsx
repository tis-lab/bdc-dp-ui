import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CohortBuilder from "./CohortBuilder";
import type { SearchItem } from "../api/graphql/queries/resolveTerms";
import { t2dSummary } from "../mocks/SYNTHETIC.cohortSummary";
import { AVAILABLE_PARTICIPANTS_PLACEHOLDER } from "../placeholders";

const AVAILABLE = AVAILABLE_PARTICIPANTS_PLACEHOLDER.toLocaleString();

const hypertension: SearchItem = {
  __typename: "Term",
  id: "HP:0000822",
  label: "Hypertension",
  category: "biolink:PhenotypicFeature",
  description: null,
  synonyms: null,
  bdc: { studyCount: 0, studies: [], variableNames: [] },
};

const diabetes: SearchItem = { ...hypertension, id: "MONDO:0005148", label: "Diabetes" };

// Search has its own tests; this stub only reports clicks
vi.mock("./Search", () => ({
  default: ({
    onInclude,
    onExclude,
  }: {
    onInclude: (item: SearchItem) => void;
    onExclude: (item: SearchItem) => void;
  }) => (
    <div>
      <button onClick={() => onInclude(hypertension)}>include result</button>
      <button onClick={() => onExclude(hypertension)}>exclude result</button>
      <button onClick={() => onInclude(diabetes)}>include other result</button>
    </div>
  ),
}));

beforeEach(() => {
  vi.stubEnv("VITE_GRAPHQL_URL", "https://graphql.test/graphql");
  vi.spyOn(globalThis, "fetch").mockImplementation(
    async () =>
      new Response(JSON.stringify({ data: { summary: t2dSummary } }), {
        status: 200,
      }),
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function renderBuilder() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <CohortBuilder />
    </QueryClientProvider>,
  );
}

const querySection = (name: "Include" | "Exclude") =>
  screen.queryByRole("region", { name });

describe("CohortBuilder", () => {
  it("renders the search and the cohort snapshot", () => {
    renderBuilder();

    expect(screen.getByRole("button", { name: "include result" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Cohort Snapshot" }),
    ).toBeInTheDocument();
  });

  it("shows one empty state, without Include and Exclude, before anything is added", () => {
    renderBuilder();

    const criteria = screen.getByRole("region", { name: "Cohort Criteria" });
    expect(criteria).toHaveTextContent("0 criteria");
    expect(within(criteria).getByText("No criteria added yet")).toBeInTheDocument();
    expect(querySection("Include")).toBeNull();
    expect(querySection("Exclude")).toBeNull();
  });

  it("adds an included concept to the Include section only", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: "include result" }));

    expect(within(querySection("Include")!).getByText("Hypertension")).toBeInTheDocument();
    expect(within(querySection("Exclude")!).getByText("No exclusion criteria added"))
      .toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Cohort Criteria" })).toHaveTextContent(
      "1 criterion",
    );
  });

  it("does not add the same concept twice", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: "include result" }));
    await user.click(screen.getByRole("button", { name: "include result" }));

    expect(within(querySection("Include")!).getAllByText("Hypertension")).toHaveLength(1);
  });

  it("moves a concept when it is excluded after being included", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: "include result" }));
    await user.click(screen.getByRole("button", { name: "exclude result" }));

    expect(within(querySection("Include")!).getByText("No inclusion criteria added"))
      .toBeInTheDocument();
    expect(within(querySection("Exclude")!).getByText("Hypertension")).toBeInTheDocument();
  });

  it("removes a concept, showing the empty state again", async () => {
    const user = userEvent.setup();
    renderBuilder();

    await user.click(screen.getByRole("button", { name: "include result" }));
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(screen.getByText("No criteria added yet")).toBeInTheDocument();
    expect(querySection("Include")).toBeNull();
  });

  describe("cohort overview", () => {
    it("shows everyone available, without asking the API, before anything is added", () => {
      renderBuilder();

      expect(screen.getByText(AVAILABLE)).toBeInTheDocument();
      expect(screen.getByText("Include a concept to see its demographic breakdown.")).toBeInTheDocument();
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it("shows the API's summary once a concept is included", async () => {
      const user = userEvent.setup();
      renderBuilder();

      await user.click(screen.getByRole("button", { name: "include result" }));

      // 940 from the API, plus the placeholder's 50 for one include
      expect(await screen.findByText("990")).toBeInTheDocument();
      expect(screen.getByText(`of ${AVAILABLE} available`)).toBeInTheDocument();
      expect(screen.getByText("990 participants · 2 studies")).toBeInTheDocument();
      const body = JSON.parse(
        vi.mocked(globalThis.fetch).mock.calls[0][1]?.body as string,
      );
      expect(body.variables).toEqual({
        sourceId: "t2d",
        include: ["HP:0000822"],
        exclude: [],
      });
    });

    it("offers AND/OR once two concepts are included, and the count follows it", async () => {
      const user = userEvent.setup();
      renderBuilder();

      await user.click(screen.getByRole("button", { name: "include result" }));
      await screen.findByText("990");
      expect(screen.queryByRole("group", { name: "Inclusion logic" })).toBeNull();

      await user.click(screen.getByRole("button", { name: "include other result" }));
      const match = screen.getByRole("group", { name: "Inclusion logic" });
      expect(
        screen.getByText("Counts are illustrative until the summary API supports AND/OR."),
      ).toBeInTheDocument();
      expect(within(match).getByRole("button", { name: "All criteria AND" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      // Placeholder counts: 940 from the API, narrowed by AND, widened by OR
      expect(await screen.findByText("940")).toBeInTheDocument();

      await user.click(within(match).getByRole("button", { name: "Any criterion OR" }));
      expect(await screen.findByText("1,040")).toBeInTheDocument();
    });

    it("goes back to everyone available once every criterion is removed", async () => {
      const user = userEvent.setup();
      renderBuilder();

      await user.click(screen.getByRole("button", { name: "include result" }));
      await screen.findByText("990");
      await user.click(screen.getByRole("button", { name: "Remove" }));

      expect(await screen.findByText(AVAILABLE)).toBeInTheDocument();
    });
  });
});

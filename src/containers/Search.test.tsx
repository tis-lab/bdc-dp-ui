import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Search from "./Search";
import { useConceptSearch } from "../hooks/useConceptSearch";
import { useConceptSuggestions } from "../hooks/useConceptSuggestions";
import type { SearchItem } from "../api/graphql/queries/resolveTerms";
import type {
  Suggestion,
  SuggestionsPage,
} from "../api/graphql/queries/autocomplete";

// ----------------------------------------------------------------------

/* Mocks */

vi.mock("../hooks/useConceptSearch", () => ({
  useConceptSearch: vi.fn(),
}));

vi.mock("../hooks/useConceptSuggestions", () => ({
  useConceptSuggestions: vi.fn(),
}));

// Stub so these tests don't depend on Notification's internals.
// The dismiss button lets tests exercise onClose.
vi.mock("../components/Notification/Notification", () => ({
  default: ({
    open,
    severity,
    message,
    onClose,
  }: {
    open: boolean;
    severity: string;
    message?: string;
    onClose?: () => void;
  }) =>
    open ? (
      <div role="alert" data-severity={severity}>
        {message}
        <button type="button" onClick={onClose}>
          Dismiss
        </button>
      </div>
    ) : null,
}));

// jsdom doesn't implement scrollTo; stub it so page changes don't log errors
const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});

const mockedUseConceptSearch = vi.mocked(useConceptSearch);
const mockedUseConceptSuggestions = vi.mocked(useConceptSuggestions);

type SearchResult = ReturnType<typeof useConceptSearch>;
type SearchOptions = Parameters<typeof useConceptSearch>[1];
type SuggestionsResult = ReturnType<typeof useConceptSuggestions>;

/** Only the fields Search reads from the response. */
type SearchData = Pick<
  NonNullable<SearchResult["data"]>,
  "items" | "total" | "limit" | "offset"
>;

/** Only the fields Search reads; the rest of UseQueryResult is irrelevant here. */
type QueryState<T> = {
  data: T | undefined;
  isLoading: boolean;
  isPlaceholderData?: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
};

type SearchState = QueryState<SearchData>;
type SuggestionState = QueryState<SuggestionsPage>;

const PAGE_SIZE = 20;
const SUGGESTION_LIMIT = 10; // names shown
const SUGGESTION_UPSTREAM_CAP = 10; // the server returns at most this many
const SUGGESTION_DELAY_MS = 300;
const SUGGESTION_ERROR_MESSAGE =
  "Suggestions are unavailable right now. You can still search.";

const idle = {
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  error: null,
};

/*
 * Results come from useConceptSearch and suggestions from useConceptSuggestions,
 * so each hook gets its own responder and can be set up independently.
 */
let respondToResults: (term: string, options: SearchOptions) => SearchState;
let respondToSuggestions: (text: string) => SuggestionState;

function installMocks() {
  // Cast once here instead of faking every UseQueryResult field
  mockedUseConceptSearch.mockImplementation(
    (term, options) =>
      respondToResults(term, options) as unknown as SearchResult,
  );
  mockedUseConceptSuggestions.mockImplementation(
    (text) => respondToSuggestions(text) as unknown as SuggestionsResult,
  );
}

/**
 * Results: returns `state` for any non-empty term and `idle` for "",
 * mirroring a hook that only fetches once something is submitted.
 */
function mockSearch(state: Partial<SearchState>) {
  respondToResults = (term) => (term ? { ...idle, ...state } : idle);
}

/**
 * Results: serves `all` one page at a time, honoring the limit/offset
 * Search passes in, like the real server would.
 */
function mockPagedSearch(all: SearchItem[]) {
  respondToResults = (term, options) => {
    if (!term) return idle;
    const { limit = PAGE_SIZE, offset = 0 } = options ?? {};
    return {
      ...idle,
      data: {
        items: all.slice(offset, offset + limit),
        total: all.length,
        limit,
        offset,
      },
    };
  };
}

/**
 * Suggestions: returns `state` for any non-empty typed text and `idle`
 * for "", mirroring the hook being disabled for empty text.
 */
function mockSuggestions(state: Partial<SuggestionState>) {
  respondToSuggestions = (text) => (text ? { ...idle, ...state } : idle);
}

// ----------------------------------------------------------------------

/* Fixtures & helpers */

type TermItem = Extract<SearchItem, { __typename: "Term" }>;
type VariableItem = Extract<SearchItem, { __typename: "BdcVariable" }>;

const makeTerm = (id: string, label: string): TermItem => ({
  __typename: "Term",
  id,
  label,
  category: "Disease or Syndrome",
  description: null,
  synonyms: null,
  // Not harmonized in any study; 0 is common in real data too
  bdc: { studyCount: 0, studies: [], variableNames: [] },
});

const makeTerms = (count: number) =>
  Array.from({ length: count }, (_, i) =>
    makeTerm(`C${String(i + 1).padStart(7, "0")}`, `Concept ${i + 1}`),
  );

const makeVariable = (name: string, label: string): VariableItem => ({
  __typename: "BdcVariable",
  name,
  label,
  domain: "BLOOD_PRESSURE",
  studyCount: 2,
  studies: ["ARIC", "CHS"],
  concepts: ["HP:0000822"],
});

/** A single-page response containing `items`. */
const resultsOf = (
  items: SearchItem[],
  overrides: Partial<SearchData> = {},
): SearchData => ({
  items,
  total: items.length,
  limit: PAGE_SIZE,
  offset: 0,
  ...overrides,
});

const toSuggestion = (term: TermItem): Suggestion => ({
  id: term.id,
  label: term.label,
  category: term.category,
  displayLabel: term.label,
  description: term.description,
});

/** A suggestions response containing `terms`, shaped like the autocomplete page. */
const suggestionsOf = (terms: TermItem[]): SuggestionsPage => ({
  items: terms.map(toSuggestion),
  total: terms.length,
});

const asthma = makeTerm("C0004096", "Asthma");
const systolicBp = makeVariable("bp_systolic", "Systolic blood pressure");
const childhoodAsthma = makeTerm("C0264408", "Childhood asthma");

// MUI's Autocomplete gives the input role="combobox"
const getInput = () => screen.getByRole("combobox", { name: "Search" });
const getSearchButton = () => screen.getByRole("button", { name: "Search" });
const getStatus = () => screen.getByRole("status");
const queryStatus = () => screen.queryByRole("status");
const queryListbox = () => screen.queryByRole("listbox");
const queryPagination = () =>
  screen.queryByRole("navigation", { name: "pagination navigation" });
const getCardTitles = () =>
  screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);

/** The open notification with the given severity, if any. */
const queryAlert = (severity: "error" | "warning") =>
  screen
    .queryAllByRole("alert")
    .find((alert) => alert.getAttribute("data-severity") === severity) ?? null;
const findAlert = (severity: "error" | "warning") =>
  waitFor(() => {
    const alert = queryAlert(severity);
    expect(alert).not.toBeNull();
    return alert as HTMLElement;
  });
const dismiss = (
  user: ReturnType<typeof userEvent.setup>,
  alert: HTMLElement,
) => user.click(within(alert).getByRole("button", { name: "Dismiss" }));

const resultCalls = () => mockedUseConceptSearch.mock.calls;
const suggestionCalls = () => mockedUseConceptSuggestions.mock.calls;
const last = <T,>(list: T[]) => list[list.length - 1];

const lastSearchedTerm = () => last(resultCalls())?.[0];
const lastSearchOptions = () => last(resultCalls())?.[1];
const lastSuggestionTerm = () => last(suggestionCalls())?.[0];
const suggestionTerms = () => new Set(suggestionCalls().map(([text]) => text));

async function searchFor(term: string) {
  const user = userEvent.setup();
  await user.type(getInput(), `${term}{Enter}`);
  return user;
}

/** Types `text` and waits for the debounced suggestions to open. */
async function typeAndWaitForSuggestions(text: string) {
  const user = userEvent.setup();
  await user.type(getInput(), text);
  await screen.findByRole("listbox");
  return user;
}

beforeEach(() => {
  mockedUseConceptSearch.mockReset();
  mockedUseConceptSuggestions.mockReset();
  scrollToSpy.mockClear();
  mockSearch({});
  mockSuggestions({});
  installMocks();
});

// ----------------------------------------------------------------------

describe("Search", () => {
  describe("initial state", () => {
    it("renders the search box and Search button", () => {
      render(<Search />);
      expect(getInput()).toBeInTheDocument();
      expect(getSearchButton()).toBeInTheDocument();
    });

    it("prompts with a placeholder and example searches before anything is submitted", () => {
      render(<Search />);
      expect(getInput()).toHaveAttribute("placeholder", "Search concepts…");
      expect(screen.getByText("Search for a concept above, or try:")).toBeInTheDocument();
    });

    it("hides the example searches once a search is submitted", async () => {
      mockSearch({ data: resultsOf([asthma]) });
      render(<Search />);

      await searchFor("asthma");

      expect(screen.queryByText("Search for a concept above, or try:")).toBeNull();
    });

    it("searches an example term when it is clicked", async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.click(screen.getByRole("button", { name: "heart failure" }));

      expect(lastSearchedTerm()).toBe("heart failure");
      expect(getInput()).toHaveValue("heart failure");
    });

    it("does not search before anything is submitted", () => {
      render(<Search />);
      expect(lastSearchedTerm()).toBe("");
    });

    it("requests the first page", () => {
      render(<Search />);
      expect(lastSearchOptions()).toEqual({ limit: PAGE_SIZE, offset: 0 });
    });

    it("does not request suggestions", () => {
      render(<Search />);
      expect(lastSuggestionTerm()).toBe("");
    });

    it("shows no progress, summary, results, pagination, dropdown, or notification", () => {
      render(<Search />);
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(queryStatus()).not.toBeInTheDocument();
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(queryPagination()).not.toBeInTheDocument();
      expect(queryListbox()).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("submitting", () => {
    it("does not search while typing", async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.type(getInput(), "asthma");

      expect(lastSearchedTerm()).toBe("");
    });

    it("searches with the trimmed term on Enter", async () => {
      render(<Search />);

      await searchFor("  asthma  ");

      expect(lastSearchedTerm()).toBe("asthma");
    });

    it("searches when the Search button is clicked", async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.type(getInput(), "asthma");
      await user.click(getSearchButton());

      expect(lastSearchedTerm()).toBe("asthma");
    });

    it("links the Search button to the search form", () => {
      render(<Search />);
      const formId = screen.getByRole("search").getAttribute("id");
      expect(formId).toBeTruthy();
      expect(getSearchButton()).toHaveAttribute("form", formId);
    });

    it("keeps the typed value after searching", async () => {
      mockSearch({ data: resultsOf([asthma]) });
      render(<Search />);

      await searchFor("asthma");

      expect(getInput()).toHaveValue("asthma");
    });
  });

  describe("autocomplete", () => {
    beforeEach(() =>
      mockSuggestions({ data: suggestionsOf([asthma, childhoodAsthma]) }),
    );

    it(`requests suggestions only after a ${SUGGESTION_DELAY_MS} ms pause`, async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.type(getInput(), "asthma");

      // Typing is faster than the delay, so nothing has been requested yet
      expect(lastSuggestionTerm()).toBe("");
      await waitFor(() => expect(lastSuggestionTerm()).toBe("asthma"));
    });

    it("requests only the text after the pause, not every keystroke", async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.type(getInput(), "asthma");
      await waitFor(() => expect(lastSuggestionTerm()).toBe("asthma"));

      expect(suggestionTerms()).toEqual(new Set(["", "asthma"]));
    });

    it("never sends the typed text to the concept search", async () => {
      render(<Search />);

      await typeAndWaitForSuggestions("asth");

      expect(resultCalls().map(([term]) => term)).not.toContain("asth");
    });

    it("shows each suggestion's name only, without its id", async () => {
      render(<Search />);

      await typeAndWaitForSuggestions("asth");

      const options = within(screen.getByRole("listbox")).getAllByRole(
        "option",
      );
      expect(options.map((o) => o.textContent)).toEqual([
        "Asthma",
        "Childhood asthma",
      ]);
      expect(screen.getByRole("listbox")).not.toHaveTextContent("C0004096");
    });

    it("shows a name once when several concepts share it", async () => {
      mockSuggestions({
        data: suggestionsOf([
          makeTerm("MONDO:0005044", "hypertension"),
          makeTerm("HP:0000822", "Hypertension"),
          makeTerm("MONDO:0005149", "pulmonary hypertension"),
          makeTerm("EFO:0000537", "hypertension"),
        ]),
      });
      render(<Search />);

      await typeAndWaitForSuggestions("hyper");

      const options = screen.getAllByRole("option");
      expect(options.map((o) => o.textContent)).toEqual([
        "hypertension",
        "pulmonary hypertension",
      ]);
    });

    it(`shows all ${SUGGESTION_UPSTREAM_CAP} names the server returns, in order`, async () => {
      const terms = makeTerms(SUGGESTION_UPSTREAM_CAP);
      mockSuggestions({ data: suggestionsOf(terms) });
      render(<Search />);

      await typeAndWaitForSuggestions("concept");

      const options = screen.getAllByRole("option");
      expect(options.map((o) => o.textContent)).toEqual(
        terms.map((t) => t.label),
      );
    });

    it(`never shows more than ${SUGGESTION_LIMIT} names`, async () => {
      // More than the server sends today; guards the dropdown if the cap changes
      const terms = makeTerms(SUGGESTION_LIMIT + 5);
      mockSuggestions({ data: suggestionsOf(terms) });
      render(<Search />);

      await typeAndWaitForSuggestions("concept");

      expect(screen.getAllByRole("option")).toHaveLength(SUGGESTION_LIMIT);
    });

    it("shows nothing when the server returns no suggestions", async () => {
      mockSuggestions({ data: suggestionsOf([]) });
      const user = userEvent.setup();
      render(<Search />);

      await user.type(getInput(), "zzzz");
      await waitFor(() => expect(lastSuggestionTerm()).toBe("zzzz"));

      expect(screen.queryAllByRole("option")).toHaveLength(0);
    });

    it('shows "Searching…" while suggestions load', async () => {
      mockSuggestions({ isFetching: true });
      const user = userEvent.setup();
      render(<Search />);

      await user.type(getInput(), "asth");

      expect(await screen.findByText("Searching…")).toBeInTheDocument();
    });

    it("clears the suggestions when the input is cleared, even if the hook still holds data", async () => {
      // Simulates placeholderData: keepPreviousData, which keeps returning
      // the last suggestions after the hook is disabled
      respondToSuggestions = () => ({
        ...idle,
        data: suggestionsOf([asthma, childhoodAsthma]),
      });
      render(<Search />);
      const user = await typeAndWaitForSuggestions("asth");

      await user.clear(getInput());

      await waitFor(() => expect(queryListbox()).not.toBeInTheDocument());
      expect(lastSuggestionTerm()).toBe("");
    });

    it("does not search while suggestions are shown", async () => {
      render(<Search />);

      await typeAndWaitForSuggestions("asth");

      expect(lastSearchedTerm()).toBe("");
      expect(queryStatus()).not.toBeInTheDocument();
    });
  });

  describe("selecting a suggestion", () => {
    beforeEach(() =>
      mockSuggestions({ data: suggestionsOf([asthma, childhoodAsthma]) }),
    );

    it("searches for the selected label on click", async () => {
      render(<Search />);
      const user = await typeAndWaitForSuggestions("asth");

      await user.click(
        screen.getByRole("option", { name: /Childhood asthma/ }),
      );

      expect(lastSearchedTerm()).toBe("Childhood asthma");
      expect(lastSearchOptions()).toEqual({ limit: PAGE_SIZE, offset: 0 });
    });

    it("searches for the highlighted label on Enter", async () => {
      render(<Search />);
      const user = await typeAndWaitForSuggestions("asth");

      await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

      expect(lastSearchedTerm()).toBe("Childhood asthma");
    });

    it("fills the input with the label and closes the dropdown", async () => {
      render(<Search />);
      const user = await typeAndWaitForSuggestions("asth");

      await user.click(
        screen.getByRole("option", { name: /Childhood asthma/ }),
      );

      expect(getInput()).toHaveValue("Childhood asthma");
      expect(queryListbox()).not.toBeInTheDocument();
    });

    it("shows the results for the selected label", async () => {
      mockSearch({ data: resultsOf([childhoodAsthma]) });
      render(<Search />);
      const user = await typeAndWaitForSuggestions("asth");

      await user.click(
        screen.getByRole("option", { name: /Childhood asthma/ }),
      );

      expect(getStatus()).toHaveTextContent(
        'Showing 1–1 of 1 concept matching "Childhood asthma"',
      );
      expect(getCardTitles()).toEqual(["Childhood asthma"]);
    });

    it("shows every concept sharing the selected name in the results", async () => {
      const shared = [
        makeTerm("MONDO:0005044", "hypertension"),
        makeTerm("HP:0000822", "hypertension"),
      ];
      mockSuggestions({ data: suggestionsOf(shared) });
      mockSearch({ data: resultsOf(shared) });
      render(<Search />);
      const user = await typeAndWaitForSuggestions("hyper");

      expect(screen.getAllByRole("option")).toHaveLength(1);
      await user.click(screen.getByRole("option", { name: "hypertension" }));

      expect(lastSearchedTerm()).toBe("hypertension");
      expect(getCardTitles()).toEqual(["hypertension", "hypertension"]);
    });

    it("does not request suggestions for the selected label", async () => {
      render(<Search />);
      const user = await typeAndWaitForSuggestions("asth");

      await user.click(
        screen.getByRole("option", { name: /Childhood asthma/ }),
      );
      // Wait past the debounce delay
      await new Promise((r) => setTimeout(r, SUGGESTION_DELAY_MS + 100));

      expect(suggestionTerms()).not.toContain("Childhood asthma");
    });

    it("shows the previous suggestions again when the input is clicked", async () => {
      render(<Search />);
      const user = await typeAndWaitForSuggestions("asth");
      await user.click(
        screen.getByRole("option", { name: /Childhood asthma/ }),
      );
      await user.click(document.body);

      await user.click(getInput());

      expect(
        screen.getByRole("option", { name: /Childhood asthma/ }),
      ).toBeInTheDocument();
      expect(lastSuggestionTerm()).toBe("asth");
    });

    it("returns to page 1", async () => {
      mockPagedSearch(makeTerms(45));
      render(<Search />);
      const user = await searchFor("concept");
      await user.click(screen.getByRole("button", { name: "Go to page 2" }));

      await user.clear(getInput());
      await user.type(getInput(), "asth");
      await user.click(await screen.findByRole("option", { name: /^Asthma/ }));

      expect(lastSearchedTerm()).toBe("Asthma");
      expect(lastSearchOptions()).toEqual({ limit: PAGE_SIZE, offset: 0 });
    });
  });

  describe("without selecting a suggestion", () => {
    beforeEach(() =>
      mockSuggestions({ data: suggestionsOf([asthma, childhoodAsthma]) }),
    );

    it("searches the typed text, not a suggestion, when Search is clicked", async () => {
      render(<Search />);
      const user = await typeAndWaitForSuggestions("asth");

      await user.click(getSearchButton());

      expect(lastSearchedTerm()).toBe("asth");
      expect(getInput()).toHaveValue("asth");
      expect(queryListbox()).not.toBeInTheDocument();
    });

    it("searches the typed text on Enter when nothing is highlighted", async () => {
      render(<Search />);
      const user = await typeAndWaitForSuggestions("asth");

      await user.keyboard("{Enter}");

      expect(lastSearchedTerm()).toBe("asth");
    });
  });

  describe("loading", () => {
    beforeEach(() => mockSearch({ isLoading: true }));

    it("shows an accessible progress indicator", async () => {
      render(<Search />);
      await searchFor("asthma");

      expect(
        screen.getByRole("progressbar", { name: "Searching concepts" }),
      ).toBeInTheDocument();
    });

    it("keeps the search controls mounted, enabled, and focused", async () => {
      render(<Search />);
      await searchFor("asthma");

      expect(getInput()).toHaveValue("asthma");
      expect(getInput()).toBeEnabled();
      expect(getInput()).toHaveFocus();
      expect(getSearchButton()).toBeInTheDocument();
    });

    it("hides the summary, results, and pagination", async () => {
      render(<Search />);
      await searchFor("asthma");

      expect(queryStatus()).not.toBeInTheDocument();
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(queryPagination()).not.toBeInTheDocument();
    });
  });

  describe("results", () => {
    it("shows a plural summary and one card per result, in order", async () => {
      mockSearch({ data: resultsOf([asthma, childhoodAsthma]) });
      render(<Search />);

      await searchFor("asthma");

      expect(getStatus()).toHaveTextContent(
        'Showing 1–2 of 2 concepts matching "asthma"',
      );
      expect(getCardTitles()).toEqual(["Asthma", "Childhood asthma"]);
    });

    it("reports each submitted term to onSearch", async () => {
      mockSearch({ data: resultsOf([asthma]) });
      const onSearch = vi.fn();
      render(<Search onSearch={onSearch} />);

      await searchFor("  asthma ");

      expect(onSearch).toHaveBeenCalledWith("asthma");
    });

    it("passes the clicked result to onInclude or onExclude", async () => {
      mockSearch({ data: resultsOf([asthma, childhoodAsthma]) });
      const onInclude = vi.fn();
      const onExclude = vi.fn();
      render(<Search onInclude={onInclude} onExclude={onExclude} />);

      const user = await searchFor("asthma");
      await user.click(screen.getAllByRole("button", { name: "+ Include" })[1]);
      await user.click(screen.getAllByRole("button", { name: "+ Exclude" })[0]);

      expect(onInclude).toHaveBeenCalledWith(childhoodAsthma);
      expect(onExclude).toHaveBeenCalledWith(asthma);
    });

    it("marks results already in the criteria, and takes them out on click", async () => {
      mockSearch({ data: resultsOf([asthma, childhoodAsthma]) });
      const removeInclude = vi.fn();
      const onRemove = vi.fn(() => removeInclude);
      render(
        <Search
          onInclude={vi.fn()}
          onExclude={vi.fn()}
          criteria={{ include: [asthma], exclude: [], match: "all" }}
          onRemove={onRemove}
        />,
      );

      const user = await searchFor("asthma");
      const included = screen.getByRole("button", { name: "✓ Included" });
      expect(included).toHaveAttribute("aria-pressed", "true");
      expect(screen.getAllByRole("button", { name: "+ Include" })).toHaveLength(
        1,
      );
      expect(screen.getAllByRole("button", { name: "+ Exclude" })).toHaveLength(
        2,
      );

      await user.click(included);
      expect(onRemove).toHaveBeenCalledWith("include");
      expect(removeInclude).toHaveBeenCalledWith(asthma);
    });

    it("shows no Include/Exclude buttons without handlers", async () => {
      mockSearch({ data: resultsOf([asthma]) });
      render(<Search />);

      await searchFor("asthma");

      expect(screen.queryByRole("button", { name: "+ Include" })).toBeNull();
      expect(screen.queryByRole("button", { name: "+ Exclude" })).toBeNull();
    });

    it("uses the singular for one result", async () => {
      mockSearch({ data: resultsOf([asthma]) });
      render(<Search />);

      await searchFor("asthma");

      expect(getStatus()).toHaveTextContent(
        'Showing 1–1 of 1 concept matching "asthma"',
      );
    });

    it("formats large totals with thousands separators", async () => {
      mockSearch({ data: resultsOf(makeTerms(PAGE_SIZE), { total: 3531 }) });
      render(<Search />);

      await searchFor("hyper");

      expect(getStatus()).toHaveTextContent(
        'Showing 1–20 of 3,531 concepts matching "hyper"',
      );
    });

    it("emphasizes the searched term", async () => {
      mockSearch({ data: resultsOf([asthma]) });
      render(<Search />);

      await searchFor("asthma");

      const strong = within(getStatus()).getByText('"asthma"');
      expect(strong.tagName).toBe("STRONG");
    });

    it("exposes the summary as a polite live region", async () => {
      mockSearch({ data: resultsOf([asthma]) });
      render(<Search />);

      await searchFor("asthma");

      expect(getStatus()).toHaveAttribute("aria-live", "polite");
    });

    it("shows the submitted term, not what is currently typed", async () => {
      mockSearch({ data: resultsOf([asthma]) });
      render(<Search />);
      const user = await searchFor("asthma");

      await user.type(getInput(), " attack");

      expect(getStatus()).toHaveTextContent('matching "asthma"');
      expect(getStatus()).not.toHaveTextContent("attack");
    });

    it("hides the progress indicator", async () => {
      mockSearch({ data: resultsOf([asthma]) });
      render(<Search />);

      await searchFor("asthma");

      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  describe("harmonized variables", () => {
    it("shows variable and term cards together, in the order returned", async () => {
      mockSearch({ data: resultsOf([systolicBp, asthma, childhoodAsthma]) });
      render(<Search />);

      await searchFor("pressure");

      expect(getCardTitles()).toEqual([
        "Systolic blood pressure",
        "Asthma",
        "Childhood asthma",
      ]);
    });

    it("badges only the variable cards as harmonized variables", async () => {
      mockSearch({ data: resultsOf([systolicBp, asthma]) });
      render(<Search />);

      await searchFor("pressure");

      expect(screen.getAllByText("Harmonized Variable")).toHaveLength(1);
    });

    it("counts variables and terms together in the summary", async () => {
      mockSearch({ data: resultsOf([systolicBp, asthma]) });
      render(<Search />);

      await searchFor("pressure");

      expect(getStatus()).toHaveTextContent(
        'Showing 1–2 of 2 concepts matching "pressure"',
      );
    });

    it("keys cards uniquely even when a variable name matches a term id", async () => {
      // Without the type prefix in the key, React would warn about duplicates
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockSearch({
        data: resultsOf([makeVariable("C0004096", "Asthma variable"), asthma]),
      });
      render(<Search />);

      await searchFor("asthma");

      expect(getCardTitles()).toEqual(["Asthma variable", "Asthma"]);
      const keyWarnings = errorSpy.mock.calls.filter((args) =>
        String(args[0]).includes("same key"),
      );
      expect(keyWarnings).toHaveLength(0);
      errorSpy.mockRestore();
    });
  });

  describe("no results", () => {
    it("shows an empty-state message", async () => {
      mockSearch({ data: resultsOf([]) });
      render(<Search />);

      await searchFor("zzzz");

      expect(getStatus()).toHaveTextContent(
        'No concepts match "zzzz". Try a different term.',
      );
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(queryPagination()).not.toBeInTheDocument();
    });

    it("treats missing data the same as an empty list", async () => {
      mockSearch({ data: undefined });
      render(<Search />);

      await searchFor("zzzz");

      expect(getStatus()).toHaveTextContent('No concepts match "zzzz"');
    });
  });

  describe("search error", () => {
    beforeEach(() =>
      mockSearch({ isError: true, error: new Error("Network down") }),
    );

    it("opens an error notification with the error message", async () => {
      render(<Search />);
      await searchFor("asthma");

      const alert = queryAlert("error");
      expect(alert).toHaveTextContent("Network down");
    });

    it("does not show the summary or empty-state message on error", async () => {
      render(<Search />);
      await searchFor("asthma");

      expect(queryStatus()).not.toBeInTheDocument();
    });

    it("stays closed after being dismissed", async () => {
      render(<Search />);
      const user = await searchFor("asthma");

      await dismiss(user, queryAlert("error") as HTMLElement);

      expect(queryAlert("error")).toBeNull();
    });

    it("opens again when a new search fails", async () => {
      render(<Search />);
      const user = await searchFor("asthma");
      await dismiss(user, queryAlert("error") as HTMLElement);

      mockSearch({ isError: true, error: new Error("Still down") });
      await user.clear(getInput());
      await user.type(getInput(), "copd{Enter}");

      expect(queryAlert("error")).toHaveTextContent("Still down");
    });
  });

  describe("autocomplete error", () => {
    beforeEach(() =>
      mockSuggestions({ isError: true, error: new Error("Suggest failed") }),
    );

    it("opens a warning that search still works", async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.type(getInput(), "asth");

      const alert = await findAlert("warning");
      expect(alert).toHaveTextContent(SUGGESTION_ERROR_MESSAGE);
      expect(alert).not.toHaveTextContent("Suggest failed");
    });

    it("does not open the search error notification", async () => {
      const user = userEvent.setup();
      render(<Search />);

      await user.type(getInput(), "asth");
      await findAlert("warning");

      expect(queryAlert("error")).toBeNull();
    });

    it("does not open before anything is typed", () => {
      render(<Search />);
      expect(queryAlert("warning")).toBeNull();
    });

    it("stays closed after being dismissed", async () => {
      const user = userEvent.setup();
      render(<Search />);
      await user.type(getInput(), "asth");

      await dismiss(user, await findAlert("warning"));

      expect(queryAlert("warning")).toBeNull();
    });

    it("opens again when a later request fails with a new error", async () => {
      const user = userEvent.setup();
      render(<Search />);
      await user.type(getInput(), "asth");
      await dismiss(user, await findAlert("warning"));

      mockSuggestions({ isError: true, error: new Error("Failed again") });
      await user.type(getInput(), "ma");

      expect(await findAlert("warning")).toBeInTheDocument();
    });

    it("still lets the user search", async () => {
      mockSearch({ data: resultsOf([asthma]) });
      render(<Search />);

      await searchFor("asthma");

      expect(getStatus()).toHaveTextContent(
        'Showing 1–1 of 1 concept matching "asthma"',
      );
    });
  });

  describe("both errors", () => {
    beforeEach(() => {
      mockSearch({ isError: true, error: new Error("Network down") });
      mockSuggestions({ isError: true, error: new Error("Suggest failed") });
    });

    it("shows both notifications at once", async () => {
      render(<Search />);
      await searchFor("asthma");

      expect(await findAlert("warning")).toBeInTheDocument();
      expect(queryAlert("error")).toHaveTextContent("Network down");
    });

    it("dismissing the search error leaves the autocomplete warning open", async () => {
      render(<Search />);
      const user = await searchFor("asthma");
      await findAlert("warning");

      await dismiss(user, queryAlert("error") as HTMLElement);

      expect(queryAlert("error")).toBeNull();
      expect(queryAlert("warning")).toBeInTheDocument();
    });

    it("dismissing the autocomplete warning leaves the search error open", async () => {
      render(<Search />);
      const user = await searchFor("asthma");

      await dismiss(user, await findAlert("warning"));

      expect(queryAlert("warning")).toBeNull();
      expect(queryAlert("error")).toHaveTextContent("Network down");
    });
  });

  describe("pagination", () => {
    it("shows placeholder cards instead of the previous page while the next loads", async () => {
      mockSearch({ data: resultsOf([asthma]), isPlaceholderData: true });
      render(<Search onInclude={vi.fn()} />);

      await searchFor("asthma");

      expect(screen.getByRole("progressbar", { name: "Loading page" })).toBeInTheDocument();
      expect(screen.queryByText(asthma.label)).toBeNull();
    });

    it("is hidden when all results fit on one page", async () => {
      mockPagedSearch(makeTerms(PAGE_SIZE));
      render(<Search />);

      await searchFor("concept");

      expect(queryPagination()).not.toBeInTheDocument();
    });

    it("shows one button per page, starting on page 1", async () => {
      mockPagedSearch(makeTerms(45)); // 3 pages
      render(<Search />);

      await searchFor("concept");

      expect(queryPagination()).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "page 1" })).toHaveAttribute(
        "aria-current",
      );
      expect(
        screen.getByRole("button", { name: "Go to page 3" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Go to page 4" }),
      ).not.toBeInTheDocument();
    });

    it("requests the selected page's offset", async () => {
      mockPagedSearch(makeTerms(45));
      render(<Search />);
      const user = await searchFor("concept");

      await user.click(screen.getByRole("button", { name: "Go to page 2" }));

      expect(lastSearchedTerm()).toBe("concept");
      expect(lastSearchOptions()).toEqual({ limit: PAGE_SIZE, offset: 20 });
    });

    it("shows the range and results for the current page", async () => {
      mockPagedSearch(makeTerms(45));
      render(<Search />);
      const user = await searchFor("concept");

      await user.click(screen.getByRole("button", { name: "Go to page 2" }));

      expect(getStatus()).toHaveTextContent(
        'Showing 21–40 of 45 concepts matching "concept"',
      );
      const titles = getCardTitles();
      expect(titles).toHaveLength(20);
      expect(titles[0]).toBe("Concept 21");
      expect(titles[19]).toBe("Concept 40");
    });

    it("shows a partial range on the last page", async () => {
      mockPagedSearch(makeTerms(45));
      render(<Search />);
      const user = await searchFor("concept");

      await user.click(screen.getByRole("button", { name: "Go to page 3" }));

      expect(getStatus()).toHaveTextContent("Showing 41–45 of 45 concepts");
      expect(getCardTitles()).toHaveLength(5);
    });

    it("marks the selected page as current", async () => {
      mockPagedSearch(makeTerms(45));
      render(<Search />);
      const user = await searchFor("concept");

      await user.click(screen.getByRole("button", { name: "Go to page 2" }));

      expect(screen.getByRole("button", { name: "page 2" })).toHaveAttribute(
        "aria-current",
      );
    });

    it("scrolls back to the top on page change", async () => {
      mockPagedSearch(makeTerms(45));
      render(<Search />);
      const user = await searchFor("concept");

      await user.click(screen.getByRole("button", { name: "Go to page 2" }));

      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    });

    it("scrolls the result list back to the top on page change", async () => {
      mockPagedSearch(makeTerms(45));
      render(<Search />);
      const user = await searchFor("concept");
      const list = screen
        .getAllByRole("heading", { level: 2 })[0]
        .closest(".MuiCard-root")!.parentElement!;
      list.scrollTop = 300;

      await user.click(screen.getByRole("button", { name: "Go to page 2" }));

      expect(list.scrollTop).toBe(0);
    });

    it("returns to page 1 on a new search", async () => {
      mockPagedSearch(makeTerms(45));
      render(<Search />);
      const user = await searchFor("concept");
      await user.click(screen.getByRole("button", { name: "Go to page 2" }));

      await user.clear(getInput());
      await user.type(getInput(), "asthma{Enter}");

      expect(lastSearchedTerm()).toBe("asthma");
      expect(lastSearchOptions()).toEqual({ limit: PAGE_SIZE, offset: 0 });
      expect(screen.getByRole("button", { name: "page 1" })).toHaveAttribute(
        "aria-current",
      );

      // The new term must never be requested with the old page's offset
      const asthmaCalls = resultCalls().filter(([term]) => term === "asthma");
      expect(asthmaCalls.every(([, options]) => options?.offset === 0)).toBe(
        true,
      );
    });
  });

  describe("multiple instances", () => {
    it("gives each instance its own form id", () => {
      render(
        <>
          <Search />
          <Search />
        </>,
      );
      const ids = screen
        .getAllByRole("search")
        .map((form) => form.getAttribute("id"));
      expect(new Set(ids).size).toBe(2);
    });

    it("each Search button submits only its own form", async () => {
      const user = userEvent.setup();
      render(
        <>
          <Search />
          <Search />
        </>,
      );
      const [firstInput, secondInput] = screen.getAllByRole("combobox");
      const [, secondButton] = screen.getAllByRole("button", {
        name: "Search",
      });

      await user.type(firstInput, "first");
      await user.type(secondInput, "second");
      await user.click(secondButton);

      const searchedTerms = resultCalls().map(([term]) => term);
      expect(searchedTerms).toContain("second");
      expect(searchedTerms).not.toContain("first");
    });
  });
});

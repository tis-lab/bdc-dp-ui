import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConceptSearchbar from "./ConceptSearchbar";
import { useConceptSuggestions } from "../../hooks/useConceptSuggestions";

// ----------------------------------------------------------------------

// Debouncing has its own tests; here typed text goes straight through
jest.mock("../../hooks/useDebouncedValue", () => ({
  useDebouncedValue: <T,>(value: T) => value,
}));

jest.mock("../../hooks/useConceptSuggestions", () => ({
  useConceptSuggestions: jest.fn(),
}));

interface SearchbarProps {
  id: string;
  value: string;
  placeholder?: string;
  options: string[];
  loading: boolean;
  onChange: (text: string, reason: string) => void;
  onSearch: (text: string) => void;
  onSelect: (name: string) => void;
}

// Records every render of the stand-in Searchbar, so tests can read the
// props ConceptSearchbar passed it. Jest only lets a mock factory use
// outside variables whose names start with "mock".
const mockSearchbarRenders = jest.fn();

// Stand-in for Searchbar: a plain form and input. These tests cover what
// ConceptSearchbar passes to Searchbar and does with its callbacks;
// Searchbar's own autocomplete behavior belongs in Searchbar's tests.
// A function declaration, so it exists before the hoisted mock runs.
function MockSearchbar(props: SearchbarProps) {
  mockSearchbarRenders(props);
  return (
    <form
      id={props.id}
      onSubmit={(e) => {
        e.preventDefault();
        props.onSearch(props.value);
      }}
    >
      <input
        aria-label="Search concepts"
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value, "input")}
      />
    </form>
  );
}

jest.mock("../Searchbar", () => ({
  __esModule: true,
  default: (props: SearchbarProps) => MockSearchbar(props),
}));

// ----------------------------------------------------------------------

const searchbarCalls = () =>
  mockSearchbarRenders.mock.calls.map(([props]) => props as SearchbarProps);
const lastSearchbarProps = () => {
  const calls = searchbarCalls();
  return calls[calls.length - 1];
};

const suggestionsHook = useConceptSuggestions as jest.MockedFunction<
  typeof useConceptSuggestions
>;

function mockSuggestions(
  state: Partial<{
    data: { items: { label: string }[] };
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
  }> = {},
) {
  suggestionsHook.mockReturnValue({
    data: undefined,
    isFetching: false,
    isError: false,
    error: null,
    ...state,
  } as unknown as ReturnType<typeof useConceptSuggestions>);
}

const items = (...labels: string[]) => ({
  items: labels.map((label) => ({ label })),
});

const input = () => screen.getByRole("textbox", { name: "Search concepts" });

beforeEach(() => {
  jest.clearAllMocks();
  mockSuggestions();
});

// ----------------------------------------------------------------------

describe("ConceptSearchbar", () => {
  describe("input", () => {
    it("uses the default placeholder", () => {
      render(<ConceptSearchbar onSearch={jest.fn()} />);
      expect(screen.getByPlaceholderText("Search concepts…")).toBeVisible();
    });

    it("uses a custom placeholder", () => {
      render(
        <ConceptSearchbar onSearch={jest.fn()} placeholder="Find a term" />,
      );
      expect(screen.getByPlaceholderText("Find a term")).toBeVisible();
    });

    it("starts with the current query", () => {
      render(<ConceptSearchbar onSearch={jest.fn()} query="asthma" />);
      expect(input()).toHaveValue("asthma");
    });

    it("follows the query when it changes from outside", () => {
      const { rerender } = render(
        <ConceptSearchbar onSearch={jest.fn()} query="asthma" />,
      );
      rerender(<ConceptSearchbar onSearch={jest.fn()} query="heart failure" />);
      expect(input()).toHaveValue("heart failure");
    });

    it("keeps typed text when the parent re-renders with the same query", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ConceptSearchbar onSearch={jest.fn()} query="" />,
      );
      await user.type(input(), "hea");
      rerender(<ConceptSearchbar onSearch={jest.fn()} query="" />);
      expect(input()).toHaveValue("hea");
    });
  });

  describe("searching", () => {
    it("searches for the typed text when Search is clicked", async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      render(<ConceptSearchbar onSearch={onSearch} />);

      await user.type(input(), "asthma");
      await user.click(screen.getByRole("button", { name: "Search" }));

      expect(onSearch).toHaveBeenCalledWith("asthma");
    });

    it("wires the Search button to the searchbar's form", () => {
      render(<ConceptSearchbar onSearch={jest.fn()} />);
      const button = screen.getByRole("button", { name: "Search" });
      expect(button).toHaveAttribute("type", "submit");
      expect(button).toHaveAttribute("form", lastSearchbarProps().id);
    });

    it("gives each instance its own form id", () => {
      render(
        <>
          <ConceptSearchbar onSearch={jest.fn()} />
          <ConceptSearchbar onSearch={jest.fn()} />
        </>,
      );
      const [first, second] = searchbarCalls().map((p) => p.id);
      expect(first).not.toBe(second);
    });

    it("searches for a selected suggestion", () => {
      const onSearch = jest.fn();
      render(<ConceptSearchbar onSearch={onSearch} />);
      act(() => lastSearchbarProps().onSelect("Heart failure"));
      expect(onSearch).toHaveBeenCalledWith("Heart failure");
    });
  });

  describe("suggestions", () => {
    it("fetches suggestions for typed text", async () => {
      const user = userEvent.setup();
      render(<ConceptSearchbar onSearch={jest.fn()} />);
      await user.type(input(), "hea");
      expect(suggestionsHook).toHaveBeenLastCalledWith("hea");
    });

    it("fills the input with a selected option without fetching for it", async () => {
      const user = userEvent.setup();
      render(<ConceptSearchbar onSearch={jest.fn()} />);
      await user.type(input(), "hea");

      act(() => lastSearchbarProps().onChange("Heart failure", "reset"));

      expect(input()).toHaveValue("Heart failure");
      expect(suggestionsHook).toHaveBeenLastCalledWith("hea");
    });

    it("shows distinct suggestion names", async () => {
      const user = userEvent.setup();
      mockSuggestions({
        data: items("Asthma", "Asthma", "Atrial fibrillation"),
      });
      render(<ConceptSearchbar onSearch={jest.fn()} />);
      await user.type(input(), "a");
      expect(lastSearchbarProps().options).toEqual([
        "Asthma",
        "Atrial fibrillation",
      ]);
    });

    it("shows at most 10 suggestions", async () => {
      const user = userEvent.setup();
      const labels = Array.from({ length: 15 }, (_, i) => `Term ${i}`);
      mockSuggestions({ data: items(...labels) });
      render(<ConceptSearchbar onSearch={jest.fn()} />);
      await user.type(input(), "t");
      expect(lastSearchbarProps().options).toEqual(labels.slice(0, 10));
    });

    it("ignores data kept from an earlier query when nothing is typed", () => {
      mockSuggestions({ data: items("Asthma") });
      render(<ConceptSearchbar onSearch={jest.fn()} />);
      expect(lastSearchbarProps().options).toEqual([]);
    });

    it("treats whitespace as nothing typed", async () => {
      const user = userEvent.setup();
      mockSuggestions({ data: items("Asthma"), isFetching: true });
      render(<ConceptSearchbar onSearch={jest.fn()} />);
      await user.type(input(), "   ");
      expect(lastSearchbarProps().options).toEqual([]);
      expect(lastSearchbarProps().loading).toBe(false);
    });

    it("shows loading only while fetching for typed text", async () => {
      const user = userEvent.setup();
      mockSuggestions({ isFetching: true });
      render(<ConceptSearchbar onSearch={jest.fn()} />);
      expect(lastSearchbarProps().loading).toBe(false);

      await user.type(input(), "a");
      expect(lastSearchbarProps().loading).toBe(true);
    });
  });

  describe("suggestion error", () => {
    const warning = /Suggestions are unavailable right now/;

    it("shows a warning when suggestions fail", async () => {
      mockSuggestions({ isError: true, error: new Error("down") });
      render(<ConceptSearchbar onSearch={jest.fn()} />);
      expect(await screen.findByText(warning)).toBeVisible();
    });

    it("stays closed for the same error and reopens for a new one", async () => {
      const user = userEvent.setup();
      mockSuggestions({ isError: true, error: new Error("down") });
      const { rerender } = render(<ConceptSearchbar onSearch={jest.fn()} />);

      await screen.findByText(warning);
      await user.click(screen.getByRole("button", { name: /close/i }));
      await waitFor(() =>
        expect(screen.queryByText(warning)).not.toBeInTheDocument(),
      );

      // Same error object: still closed
      rerender(<ConceptSearchbar onSearch={jest.fn()} />);
      expect(screen.queryByText(warning)).not.toBeInTheDocument();

      // A new failure: open again
      mockSuggestions({ isError: true, error: new Error("down again") });
      rerender(<ConceptSearchbar onSearch={jest.fn()} />);
      expect(await screen.findByText(warning)).toBeVisible();
    });
  });

  describe("examples", () => {
    it("hides examples by default", () => {
      render(<ConceptSearchbar onSearch={jest.fn()} />);
      expect(screen.queryByText(/or try:/)).not.toBeInTheDocument();
    });

    it("searches for an example when it is clicked", async () => {
      const user = userEvent.setup();
      const onSearch = jest.fn();
      render(<ConceptSearchbar onSearch={onSearch} showExamples />);

      await user.click(screen.getByRole("button", { name: "heart failure" }));

      expect(onSearch).toHaveBeenCalledWith("heart failure");
    });
  });
});

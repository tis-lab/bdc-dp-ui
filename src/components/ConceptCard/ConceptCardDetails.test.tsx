import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConceptCardDetails, {
  CategoryValue,
  DetailField,
} from "./ConceptCardDetails";
import parseCurie from "../../utils/parseCurie";

// ----------------------------------------------------------------------

/* Mocks */

// Parsing rules belong in parseCurie's own tests; here we only care
// how each parse result is displayed.
vi.mock("../../utils/parseCurie", () => ({
  default: vi.fn(),
}));

// Stub so these tests don't depend on SourceVariablePopover's internals;
// it has its own tests. Props are exposed so we can check what's passed,
// and the button lets tests exercise onClose.
vi.mock("./SourceVariablePopover", () => ({
  default: ({
    id,
    anchorEl,
    name,
    onClose,
  }: {
    id?: string;
    anchorEl: HTMLElement | null;
    name: string | null;
    onClose: () => void;
  }) =>
    anchorEl && name ? (
      <div
        data-testid="source-variable-popover"
        id={id}
        data-name={name}
        data-anchor={anchorEl.textContent}
      >
        <button type="button" onClick={onClose}>
          Close popover
        </button>
      </div>
    ) : null,
}));

const mockedParseCurie = vi.mocked(parseCurie);

type ParsedCurie = NonNullable<ReturnType<typeof parseCurie>>;

const parsed = (overrides: Partial<ParsedCurie> = {}) =>
  ({
    label: "Disease",
    source: "biolink",
    id: "Disease",
    raw: "biolink:Disease",
    ...overrides,
  }) as ParsedCurie;

// ----------------------------------------------------------------------

/* Helpers */

/** Reads the list as [term, definition] pairs, in DOM order. */
function getFields(container: HTMLElement) {
  return Array.from(container.querySelectorAll("dt")).map((dt) => [
    dt.textContent,
    dt.nextElementSibling?.tagName === "DD"
      ? dt.nextElementSibling.textContent
      : undefined,
  ]);
}

const VARIABLES_LABEL = "mapped / source variables";

const getVariableChip = (name: string) => screen.getByRole("button", { name });
const queryPopover = () => screen.queryByTestId("source-variable-popover");

beforeEach(() => {
  mockedParseCurie.mockReset();
  mockedParseCurie.mockImplementation((value) =>
    parsed({ label: value, source: "", id: value, raw: value }),
  );
});

// ----------------------------------------------------------------------

describe("ConceptCardDetails", () => {
  it("renders a description list", () => {
    const { container } = render(
      <ConceptCardDetails category="Disease" description="Some text" />,
    );
    expect(container.firstElementChild?.tagName).toBe("DL");
  });

  it("shows category then description", () => {
    const { container } = render(
      <ConceptCardDetails
        category="Disease or Syndrome"
        description="A chronic inflammatory disease of the airways."
      />,
    );

    expect(getFields(container)).toEqual([
      ["category", "Disease or Syndrome"],
      ["description", "A chronic inflammatory disease of the airways."],
    ]);
  });

  it("shows category, then mapped variables, then description", () => {
    const { container } = render(
      <ConceptCardDetails
        category="Disease or Syndrome"
        description="A chronic inflammatory disease of the airways."
        variableNames={["asthma_dx", "asthma_ever"]}
      />,
    );

    expect(getFields(container)).toEqual([
      ["category", "Disease or Syndrome"],
      [VARIABLES_LABEL, "asthma_dxasthma_ever"],
      ["description", "A chronic inflammatory disease of the airways."],
    ]);
  });

  it.each([undefined, []])(
    "omits mapped variables when they are %j",
    (variableNames) => {
      const { container } = render(
        <ConceptCardDetails category="Disease" variableNames={variableNames} />,
      );

      expect(getFields(container)).toEqual([["category", "Disease"]]);
    },
  );

  it.each([undefined, ""])("omits category when it is %j", (category) => {
    const { container } = render(
      <ConceptCardDetails category={category} description="Some text" />,
    );

    expect(getFields(container)).toEqual([["description", "Some text"]]);
  });

  it.each([undefined, null, ""])(
    "omits description when it is %j",
    (description) => {
      const { container } = render(
        <ConceptCardDetails category="Disease" description={description} />,
      );

      expect(getFields(container)).toEqual([["category", "Disease"]]);
    },
  );

  it("renders an empty list when there is nothing to show", () => {
    const { container } = render(<ConceptCardDetails />);

    const dl = container.querySelector("dl");
    expect(dl).toBeInTheDocument();
    expect(dl).toBeEmptyDOMElement();
  });

  it("formats the category through CategoryValue", () => {
    mockedParseCurie.mockReturnValue(parsed());
    render(<ConceptCardDetails category="biolink:Disease" />);

    expect(mockedParseCurie).toHaveBeenCalledWith("biolink:Disease");
    expect(screen.getByText("Disease")).toBeInTheDocument();
    expect(screen.getByText("biolink")).toBeInTheDocument();
  });
});

// ----------------------------------------------------------------------

describe("ConceptCardDetails mapped variables", () => {
  const variableNames = ["asthma_dx", "asthma_ever"];

  it("shows each variable name as a button", () => {
    render(<ConceptCardDetails variableNames={variableNames} />);

    expect(getVariableChip("asthma_dx")).toBeInTheDocument();
    expect(getVariableChip("asthma_ever")).toBeInTheDocument();
  });

  it("marks each chip as opening a closed dialog", () => {
    render(<ConceptCardDetails variableNames={variableNames} />);

    const chip = getVariableChip("asthma_dx");
    expect(chip).toHaveAttribute("aria-haspopup", "dialog");
    expect(chip).toHaveAttribute("aria-expanded", "false");
    expect(chip).not.toHaveAttribute("aria-controls");
  });

  it("does not show the popover until a chip is clicked", () => {
    render(<ConceptCardDetails variableNames={variableNames} />);
    expect(queryPopover()).not.toBeInTheDocument();
  });

  it("opens the popover for the clicked variable, anchored to its chip", async () => {
    const user = userEvent.setup();
    render(<ConceptCardDetails variableNames={variableNames} />);

    await user.click(getVariableChip("asthma_ever"));

    const popover = queryPopover();
    expect(popover).toHaveAttribute("data-name", "asthma_ever");
    expect(popover).toHaveAttribute("data-anchor", "asthma_ever");
  });

  it("links the open chip to the popover", async () => {
    const user = userEvent.setup();
    render(<ConceptCardDetails variableNames={variableNames} />);

    await user.click(getVariableChip("asthma_dx"));

    const chip = getVariableChip("asthma_dx");
    expect(chip).toHaveAttribute("aria-expanded", "true");
    expect(chip).toHaveAttribute("aria-controls", queryPopover()?.id);
    expect(getVariableChip("asthma_ever")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("shows one popover at a time, for the last chip clicked", async () => {
    const user = userEvent.setup();
    render(<ConceptCardDetails variableNames={variableNames} />);

    await user.click(getVariableChip("asthma_dx"));
    await user.click(getVariableChip("asthma_ever"));

    expect(screen.getAllByTestId("source-variable-popover")).toHaveLength(1);
    expect(queryPopover()).toHaveAttribute("data-name", "asthma_ever");
  });

  it("closes the popover and resets the chip on close", async () => {
    const user = userEvent.setup();
    render(<ConceptCardDetails variableNames={variableNames} />);
    await user.click(getVariableChip("asthma_dx"));

    await user.click(screen.getByRole("button", { name: "Close popover" }));

    expect(queryPopover()).not.toBeInTheDocument();
    const chip = getVariableChip("asthma_dx");
    expect(chip).toHaveAttribute("aria-expanded", "false");
    expect(chip).not.toHaveAttribute("aria-controls");
  });

  it("renders the popover outside the description list", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ConceptCardDetails variableNames={variableNames} />,
    );

    await user.click(getVariableChip("asthma_dx"));

    expect(container.querySelector("dl")).not.toContainElement(queryPopover());
  });

  it("gives each instance its own popover id", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ConceptCardDetails variableNames={["first_var"]} />
        <ConceptCardDetails variableNames={["second_var"]} />
      </>,
    );

    await user.click(getVariableChip("first_var"));
    const firstId = queryPopover()?.id;
    await user.click(screen.getByRole("button", { name: "Close popover" }));
    await user.click(getVariableChip("second_var"));

    expect(firstId).toBeTruthy();
    expect(queryPopover()?.id).not.toBe(firstId);
  });
});

// ----------------------------------------------------------------------

describe("DetailField", () => {
  it("renders the label as a term and the value as its definition", () => {
    const { container } = render(
      <dl>
        <DetailField label="synonyms" value="Bronchial asthma" />
      </dl>,
    );

    expect(getFields(container)).toEqual([["synonyms", "Bronchial asthma"]]);
  });

  it("accepts any React node as the value", () => {
    render(
      <dl>
        <DetailField
          label="source"
          value={<a href="https://example.org">Example</a>}
        />
      </dl>,
    );

    const dd = screen.getByRole("link", { name: "Example" }).closest("dd");
    expect(dd).toBeInTheDocument();
  });
});

// ----------------------------------------------------------------------

describe("CategoryValue", () => {
  it("parses the given value", () => {
    render(<CategoryValue value="biolink:Disease" />);
    expect(mockedParseCurie).toHaveBeenCalledWith("biolink:Disease");
  });

  it("shows the parsed label and a source chip", () => {
    mockedParseCurie.mockReturnValue(parsed());
    render(<CategoryValue value="biolink:Disease" />);

    expect(screen.getByText("Disease")).toBeInTheDocument();
    expect(screen.getByText("biolink")).toBeInTheDocument();
  });

  it("labels the chip with the full source name and raw CURIE", () => {
    mockedParseCurie.mockReturnValue(parsed());
    render(<CategoryValue value="biolink:Disease" />);

    expect(
      screen.getByLabelText("Biolink Model · biolink:Disease"),
    ).toHaveTextContent("biolink");
  });

  it("shows a tooltip with the full source name on hover", async () => {
    const user = userEvent.setup();
    mockedParseCurie.mockReturnValue(parsed());
    render(<CategoryValue value="biolink:Disease" />);

    await user.hover(screen.getByText("biolink"));

    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Biolink Model · biolink:Disease",
    );
  });

  it("uses the source prefix as-is when it has no known name", () => {
    mockedParseCurie.mockReturnValue(
      parsed({ label: "Asthma", source: "umls", raw: "umls:C0004096" }),
    );
    render(<CategoryValue value="umls:C0004096" />);

    expect(screen.getByLabelText("umls · umls:C0004096")).toHaveTextContent(
      "umls",
    );
  });

  it.each([undefined, ""])("omits the chip when the source is %j", (source) => {
    mockedParseCurie.mockReturnValue(parsed({ source }));
    const { container } = render(<CategoryValue value="Disease" />);

    expect(container).toHaveTextContent(/^Disease$/);
    expect(screen.queryByLabelText(/·/)).not.toBeInTheDocument();
  });
});

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConceptCard from "./ConceptCard";
import type { SearchItem } from "../../api/graphql/queries/resolveTerms";

// ----------------------------------------------------------------------

/* Mocks */

// Stub so these tests don't depend on ConceptCardDetails' internals;
// it has its own tests. Props are exposed so we can check what's passed.
vi.mock("./ConceptCardDetails", () => ({
  default: ({
    category,
    description,
    variableNames,
  }: {
    category?: string;
    description?: string | null;
    variableNames?: string[];
  }) => (
    <div
      data-testid="concept-details"
      data-category={category ?? ""}
      data-variable-names={(variableNames ?? []).join(",")}
    >
      {description}
    </div>
  ),
}));

// ----------------------------------------------------------------------

/* Fixtures & helpers */

type TermItem = Extract<SearchItem, { __typename: "Term" }>;
type VariableItem = Extract<SearchItem, { __typename: "BdcVariable" }>;

const asthma: TermItem = {
  __typename: "Term",
  id: "C0004096",
  label: "Asthma",
  category: "biolink:Disease",
  description: "A chronic inflammatory disease of the airways.",
  synonyms: null,
  bdc: { studyCount: 0, studies: [], variableNames: [] },
};

const harmonizedAsthma: TermItem = {
  ...asthma,
  bdc: {
    studyCount: 3,
    studies: ["ARIC", "CHS", "MESA"],
    variableNames: ["asthma_dx", "asthma_ever"],
  },
};

const systolicBp: VariableItem = {
  __typename: "BdcVariable",
  name: "bp_systolic",
  label: "Systolic blood pressure",
  domain: "BLOOD_PRESSURE",
  studyCount: 12,
  studies: ["ARIC", "CHS"],
  concepts: ["HP:0000822"],
};

type CardProps = Partial<Parameters<typeof ConceptCard>[0]>;

function renderCard(props: CardProps = {}) {
  return render(<ConceptCard concept={asthma} isFirst isLast {...props} />);
}

const withActions = ({ onInclude = vi.fn(), onExclude = vi.fn() } = {}) => ({
  actions: [
    { label: "+ Include", onClick: onInclude },
    { label: "+ Exclude", onClick: onExclude },
  ],
});

const getDetailsButton = () => screen.getByRole("button", { name: "Details" });
const getIncludeButton = () =>
  screen.getByRole("button", { name: "+ Include" });
const getExcludeButton = () =>
  screen.getByRole("button", { name: "+ Exclude" });
const queryDetails = () => screen.queryByTestId("concept-details");
const queryHarmonizedBadge = () => screen.queryByText("Harmonized Variable");

async function openDetails() {
  const user = userEvent.setup();
  await user.click(getDetailsButton());
  return queryDetails();
}

afterEach(() => {
  vi.restoreAllMocks();
});

// ----------------------------------------------------------------------

describe("ConceptCard", () => {
  describe("content", () => {
    it("shows the label as a level-2 heading", () => {
      renderCard();
      expect(
        screen.getByRole("heading", { level: 2, name: "Asthma" }),
      ).toBeInTheDocument();
    });

    it("shows the concept id", () => {
      renderCard();
      expect(screen.getByText(/^C0004096\b/)).toBeInTheDocument();
    });

    it("does not show the Harmonized Variable badge for a term", () => {
      renderCard();
      expect(queryHarmonizedBadge()).not.toBeInTheDocument();
    });
  });

  // The meta line shows a placeholder ("x studies") until the count is wired up.
  // Fill these in then; remember 0 can mean the index is off, not "no studies".
  describe("study count", () => {
    it.todo("shows how many studies the concept is harmonized in");
    it.todo("uses the singular for one study");
    it.todo("does not present 0 as BDC having nothing");
  });

  describe("details", () => {
    it("is collapsed by default", () => {
      renderCard();
      expect(getDetailsButton()).toHaveAttribute("aria-expanded", "false");
      expect(queryDetails()).not.toBeInTheDocument();
    });

    it("expands when Details is clicked", async () => {
      renderCard();

      await openDetails();

      expect(getDetailsButton()).toHaveAttribute("aria-expanded", "true");
      expect(queryDetails()).toBeInTheDocument();
    });

    it("points aria-controls at the panel containing the details", async () => {
      renderCard();

      await openDetails();

      const panelId = getDetailsButton().getAttribute("aria-controls");
      expect(panelId).toBeTruthy();
      const panel = document.getElementById(panelId!);
      expect(panel).toContainElement(queryDetails());
    });

    it("passes the concept's category and description", async () => {
      renderCard();

      const details = await openDetails();

      expect(details).toHaveAttribute("data-category", "biolink:Disease");
      expect(details).toHaveTextContent(
        "A chronic inflammatory disease of the airways.",
      );
    });

    it("passes the names of the variables mapped to the concept", async () => {
      renderCard({ concept: harmonizedAsthma });

      const details = await openDetails();

      expect(details).toHaveAttribute(
        "data-variable-names",
        "asthma_dx,asthma_ever",
      );
    });

    it("passes no variable names when none are mapped", async () => {
      renderCard();

      const details = await openDetails();

      expect(details).toHaveAttribute("data-variable-names", "");
    });

    it("collapses and unmounts when Details is clicked again", async () => {
      const user = userEvent.setup();
      renderCard();
      await user.click(getDetailsButton());
      const details = queryDetails();

      await user.click(getDetailsButton());

      expect(getDetailsButton()).toHaveAttribute("aria-expanded", "false");
      // unmountOnExit removes it once the collapse transition finishes
      await waitForElementToBeRemoved(details);
    });

    it("gives each card its own details panel id", () => {
      render(
        <>
          <ConceptCard concept={asthma} isFirst isLast={false} />
          <ConceptCard
            concept={{ ...asthma, id: "C0264408", label: "Childhood asthma" }}
            isFirst={false}
            isLast
          />
        </>,
      );

      const ids = screen
        .getAllByRole("button", { name: "Details" })
        .map((b) => b.getAttribute("aria-controls"));
      expect(new Set(ids).size).toBe(2);
    });

    it("toggles each card independently", async () => {
      const user = userEvent.setup();
      render(
        <>
          <ConceptCard concept={asthma} isFirst isLast={false} />
          <ConceptCard
            concept={{ ...asthma, id: "C0264408", label: "Childhood asthma" }}
            isFirst={false}
            isLast
          />
        </>,
      );
      const [first, second] = screen.getAllByRole("button", {
        name: "Details",
      });

      await user.click(second);

      expect(first).toHaveAttribute("aria-expanded", "false");
      expect(second).toHaveAttribute("aria-expanded", "true");
      expect(screen.getAllByTestId("concept-details")).toHaveLength(1);
    });
  });

  describe("harmonized variable", () => {
    it("shows the label as a level-2 heading", () => {
      renderCard({ concept: systolicBp });
      expect(
        screen.getByRole("heading", {
          level: 2,
          name: "Systolic blood pressure",
        }),
      ).toBeInTheDocument();
    });

    it("shows the Harmonized Variable badge", () => {
      renderCard({ concept: systolicBp });
      expect(queryHarmonizedBadge()).toBeInTheDocument();
    });

    it("shows the variable name as its identifier", () => {
      renderCard({ concept: systolicBp });
      expect(screen.getByText(/^bp_systolic\b/)).toBeInTheDocument();
    });

    it.each([
      ["BLOOD_PRESSURE", "Blood Pressure"],
      ["DEMOGRAPHICS", "Demographics"],
      ["SLEEP-APNEA", "Sleep Apnea"],
      ["lung function", "Lung Function"],
    ])("passes the domain %j as the category %j", async (domain, expected) => {
      renderCard({ concept: { ...systolicBp, domain } });

      const details = await openDetails();

      expect(details).toHaveAttribute("data-category", expected);
    });

    it("passes no category when the domain is null", async () => {
      renderCard({ concept: { ...systolicBp, domain: null } });

      const details = await openDetails();

      expect(details).toHaveAttribute("data-category", "");
    });

    it("passes no description or variable names", async () => {
      renderCard({ concept: systolicBp });

      const details = await openDetails();

      expect(details).toBeEmptyDOMElement();
      expect(details).toHaveAttribute("data-variable-names", "");
    });

    it("calls an action with the variable", async () => {
      const user = userEvent.setup();
      const onInclude = vi.fn();
      renderCard({ concept: systolicBp, ...withActions({ onInclude }) });

      await user.click(getIncludeButton());

      expect(onInclude).toHaveBeenCalledWith(systolicBp);
    });
  });

  describe("actions", () => {
    it("renders one button per action, in order", () => {
      renderCard(withActions());

      const buttons = screen
        .getAllByRole("button")
        .filter((b) => b.textContent !== "Details");
      expect(buttons.map((b) => b.textContent)).toEqual([
        "+ Include",
        "+ Exclude",
      ]);
    });

    it("renders no action buttons when none are given", () => {
      renderCard();

      expect(screen.queryByRole("button", { name: "+ Include" })).toBeNull();
      expect(screen.queryByRole("button", { name: "+ Exclude" })).toBeNull();
    });

    it("calls only the clicked action, with the concept", async () => {
      const user = userEvent.setup();
      const onInclude = vi.fn();
      const onExclude = vi.fn();
      renderCard(withActions({ onInclude, onExclude }));

      await user.click(getExcludeButton());

      expect(onExclude).toHaveBeenCalledOnce();
      expect(onExclude).toHaveBeenCalledWith(asthma);
      expect(onInclude).not.toHaveBeenCalled();
    });

    it("does not toggle details when an action is clicked", async () => {
      const user = userEvent.setup();
      renderCard(withActions());

      await user.click(getIncludeButton());

      expect(getDetailsButton()).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("compact", () => {
    it("shows only the name and code", () => {
      renderCard({ concept: systolicBp, compact: true });

      expect(screen.getByText("Systolic blood pressure")).toBeInTheDocument();
      expect(screen.getByText("bp_systolic")).toBeInTheDocument();
      expect(queryHarmonizedBadge()).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Details" })).toBeNull();
    });
  });

  describe("position props", () => {
    it.each([
      { isFirst: true, isLast: true },
      { isFirst: true, isLast: false },
      { isFirst: false, isLast: false },
      { isFirst: false, isLast: true },
    ])(
      "does not forward isFirst/isLast to the DOM ($isFirst, $isLast)",
      ({ isFirst, isLast }) => {
        // React logs an "unknown prop" error if these leak through styled()
        const errorSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        renderCard({ isFirst, isLast });

        expect(errorSpy).not.toHaveBeenCalled();
      },
    );
  });
});

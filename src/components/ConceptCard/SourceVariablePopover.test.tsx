import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SourceVariablePopover, {
  type Props as PopoverProps,
} from "./SourceVariablePopover";

// ----------------------------------------------------------------------

/* Fixtures & helpers */

const TITLE = "Source Variable Details";

// Anchors live outside React's tree, so they're removed by hand after each test
const anchors: HTMLElement[] = [];

/** Renders a real anchor element first, so the popover can position against it. */
function renderPopover(props: Partial<PopoverProps> = {}) {
  const onClose = vi.fn();
  const anchor = document.createElement("button");
  anchor.textContent = "hypertension";
  document.body.appendChild(anchor);
  anchors.push(anchor);

  const utils = render(
    <SourceVariablePopover
      anchorEl={anchor}
      name="hypertension"
      onClose={onClose}
      {...props}
    />,
  );

  return { ...utils, anchor, onClose };
}

const queryDialog = () => screen.queryByRole("dialog", { name: TITLE });
const getDialog = () => screen.getByRole("dialog", { name: TITLE });

afterEach(() => {
  anchors.splice(0).forEach((anchor) => anchor.remove());
});

// ----------------------------------------------------------------------

describe("SourceVariablePopover", () => {
  describe("visibility", () => {
    it("is open when it has an anchor and a name", () => {
      renderPopover();
      expect(getDialog()).toBeInTheDocument();
    });

    it("is closed without an anchor", () => {
      renderPopover({ anchorEl: null });
      expect(queryDialog()).not.toBeInTheDocument();
    });

    it("is closed without a name", () => {
      renderPopover({ name: null });
      expect(queryDialog()).not.toBeInTheDocument();
    });
  });

  describe("content", () => {
    it("is a dialog labelled by its level-3 title", () => {
      renderPopover();
      expect(
        within(getDialog()).getByRole("heading", { level: 3, name: TITLE }),
      ).toBeInTheDocument();
    });

    it("shows the variable name", () => {
      renderPopover({ name: "hypert_trt" });
      expect(within(getDialog()).getByText("hypert_trt")).toBeInTheDocument();
    });

    it("shows the description text", () => {
      renderPopover();
      expect(getDialog()).toHaveTextContent(
        /additional information sourced from the BDC Variable library/,
      );
    });

    it("applies the given id, so a trigger can point aria-controls at it", () => {
      renderPopover({ id: "variable-popover" });
      const root = document.getElementById("variable-popover");
      expect(root).toContainElement(getDialog());
    });
  });

  describe("closing", () => {
    it("has two Close buttons: the icon and the footer button", () => {
      renderPopover();
      expect(
        within(getDialog()).getAllByRole("button", { name: "Close" }),
      ).toHaveLength(2);
    });

    it.each([0, 1])("calls onClose from Close button #%i", async (index) => {
      const user = userEvent.setup();
      const { onClose } = renderPopover();

      const buttons = within(getDialog()).getAllByRole("button", {
        name: "Close",
      });
      await user.click(buttons[index]);

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("calls onClose on Escape", async () => {
      const user = userEvent.setup();
      const { onClose } = renderPopover();

      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("calls onClose when clicking outside", async () => {
      const user = userEvent.setup();
      const { onClose } = renderPopover();

      // MUI renders an invisible backdrop that catches outside clicks
      const backdrop = document.querySelector(".MuiBackdrop-root");
      expect(backdrop).not.toBeNull();
      await user.click(backdrop!);

      expect(onClose).toHaveBeenCalledOnce();
    });

    it("does not call onClose when clicking inside", async () => {
      const user = userEvent.setup();
      const { onClose } = renderPopover();

      await user.click(within(getDialog()).getByText("hypertension"));

      expect(onClose).not.toHaveBeenCalled();
    });

    it("closes once the parent clears the anchor", async () => {
      const { rerender, onClose } = renderPopover();

      rerender(
        <SourceVariablePopover anchorEl={null} name={null} onClose={onClose} />,
      );

      await waitFor(() => expect(queryDialog()).not.toBeInTheDocument());
    });
  });

  describe("focus", () => {
    it("moves focus into the dialog when it opens", async () => {
      renderPopover();
      await waitFor(() =>
        expect(getDialog()).toContainElement(
          document.activeElement as HTMLElement,
        ),
      );
    });
  });
});

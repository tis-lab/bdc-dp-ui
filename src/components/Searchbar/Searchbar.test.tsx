import { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Searchbar, { Props } from "./Searchbar";

// ----------------------------------------------------------------------

/* Fixtures */
const OPTIONS = ["asthma", "allergic asthma"];

// ----------------------------------------------------------------------

/* Helpers */
function ControlledSearchbar({
  initialValue = "",
  onChange,
  ...rest
}: Partial<Props> & { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  return (
    <Searchbar
      id="test-search"
      value={value}
      onChange={(v, reason) => {
        setValue(v);
        onChange?.(v, reason);
      }}
      {...rest}
    />
  );
}

function renderStatic(props: Partial<Props> = {}) {
  const onChange = vi.fn();
  const utils = render(
    <Searchbar id="test-search" value="" onChange={onChange} {...props} />,
  );
  return { ...utils, onChange };
}

/** The input. MUI's Autocomplete gives it role="combobox". */
function getInput() {
  return screen.getByRole("combobox");
}

// ----------------------------------------------------------------------

describe("Searchbar", () => {
  describe("rendering & accessibility", () => {
    it("renders a search landmark with the given id", () => {
      renderStatic({ id: "concept-search" });
      expect(screen.getByRole("search")).toHaveAttribute(
        "id",
        "concept-search",
      );
    });

    it("renders a combobox with the default accessible name", () => {
      renderStatic();
      expect(
        screen.getByRole("combobox", { name: "Search" }),
      ).toBeInTheDocument();
    });

    it("uses a custom aria label", () => {
      renderStatic({ ariaLabel: "Search concepts" });
      expect(
        screen.getByRole("combobox", { name: "Search concepts" }),
      ).toBeInTheDocument();
    });

    it("renders placeholder, name and type=search", () => {
      renderStatic({ placeholder: "e.g. diabetes", name: "q" });
      const input = getInput();
      expect(input).toHaveAttribute("placeholder", "e.g. diabetes");
      expect(input).toHaveAttribute("name", "q");
      expect(input).toHaveAttribute("type", "search");
    });

    it("hides the search icon from assistive tech", () => {
      const { container } = renderStatic();
      expect(container.querySelector("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("focuses the input when autoFocus is set", () => {
      renderStatic({ autoFocus: true });
      expect(getInput()).toHaveFocus();
    });

    it("does not focus the input by default", () => {
      renderStatic();
      expect(getInput()).not.toHaveFocus();
    });
  });

  describe("typing", () => {
    it('calls onChange with the new value and reason "input"', async () => {
      const user = userEvent.setup();
      const { onChange } = renderStatic();

      await user.type(getInput(), "a");

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith("a", "input");
    });

    it("reflects the full typed value when controlled by a parent", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ControlledSearchbar onChange={onChange} />);

      await user.type(getInput(), "asthma");

      expect(getInput()).toHaveValue("asthma");
      expect(onChange).toHaveBeenLastCalledWith("asthma", "input");
    });

    it("displays the value prop", () => {
      renderStatic({ value: "heart failure" });
      expect(getInput()).toHaveValue("heart failure");
    });
  });

  describe("suggestions", () => {
    it("shows no dropdown before the user types", () => {
      renderStatic({ options: OPTIONS });
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("shows each option's name, in order, once the user types", async () => {
      const user = userEvent.setup();
      render(<ControlledSearchbar options={OPTIONS} />);

      await user.type(getInput(), "ast");

      const options = within(screen.getByRole("listbox")).getAllByRole(
        "option",
      );
      expect(options.map((o) => o.textContent)).toEqual([
        "asthma",
        "allergic asthma",
      ]);
    });

    it("shows options as given, without filtering them by the typed text", async () => {
      // The server matches on synonyms too, so a label may not contain the input
      const user = userEvent.setup();
      render(<ControlledSearchbar options={["myocardial infarction"]} />);

      await user.type(getInput(), "heart attack");

      expect(
        screen.getByRole("option", { name: "myocardial infarction" }),
      ).toBeInTheDocument();
    });

    it('shows "Searching…" while loading with no options yet', async () => {
      const user = userEvent.setup();
      render(<ControlledSearchbar loading options={[]} />);

      await user.type(getInput(), "ast");

      expect(screen.getByText("Searching…")).toBeInTheDocument();
    });

    it("shows no dropdown when there are no options and nothing is loading", async () => {
      const user = userEvent.setup();
      render(<ControlledSearchbar options={[]} />);

      await user.type(getInput(), "zzz");

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(screen.queryByText("No options")).not.toBeInTheDocument();
    });

    it("reopens the dropdown when the input is clicked again", async () => {
      const user = userEvent.setup();
      render(<ControlledSearchbar options={OPTIONS} />);

      await user.type(getInput(), "ast");
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

      await user.click(getInput());

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  describe("selecting an option", () => {
    it("calls onSelect with the clicked option, not onSearch", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const onSearch = vi.fn();
      render(
        <ControlledSearchbar
          options={OPTIONS}
          onSelect={onSelect}
          onSearch={onSearch}
        />,
      );

      await user.type(getInput(), "ast");
      await user.click(screen.getByRole("option", { name: /allergic asthma/ }));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(OPTIONS[1]);
      expect(onSearch).not.toHaveBeenCalled();
    });

    it('fills the input with the label, reported with reason "selectOption"', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<ControlledSearchbar options={OPTIONS} onChange={onChange} />);

      await user.type(getInput(), "ast");
      await user.click(screen.getByRole("option", { name: /allergic asthma/ }));

      expect(getInput()).toHaveValue("allergic asthma");
      expect(onChange).toHaveBeenLastCalledWith(
        "allergic asthma",
        "selectOption",
      );
    });

    it("closes the dropdown after a selection", async () => {
      const user = userEvent.setup();
      render(<ControlledSearchbar options={OPTIONS} />);

      await user.type(getInput(), "ast");
      await user.click(screen.getByRole("option", { name: /^asthma/ }));

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("selects the highlighted option on Enter without submitting the form", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const onSearch = vi.fn();
      render(
        <ControlledSearchbar
          options={OPTIONS}
          onSelect={onSelect}
          onSearch={onSearch}
        />,
      );

      await user.type(getInput(), "ast");
      await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(OPTIONS[1]);
      expect(onSearch).not.toHaveBeenCalled();
    });
  });

  describe("submitting", () => {
    it("calls onSearch with the value when Enter is pressed", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<ControlledSearchbar onSearch={onSearch} />);

      await user.type(getInput(), "asthma{Enter}");

      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith("asthma");
    });

    it("submits the typed text, not an option, when Enter is pressed with none highlighted", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      const onSelect = vi.fn();
      render(
        <ControlledSearchbar
          options={OPTIONS}
          onSearch={onSearch}
          onSelect={onSelect}
        />,
      );

      await user.type(getInput(), "ast{Enter}");

      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith("ast");
      expect(onSelect).not.toHaveBeenCalled();
    });

    it("closes the dropdown on submit", async () => {
      const user = userEvent.setup();
      render(<ControlledSearchbar options={OPTIONS} onSearch={vi.fn()} />);

      await user.type(getInput(), "ast");
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      await user.keyboard("{Enter}");

      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("trims whitespace before calling onSearch", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<ControlledSearchbar onSearch={onSearch} />);

      await user.type(getInput(), "  asthma  {Enter}");

      expect(onSearch).toHaveBeenCalledWith("asthma");
    });

    it("calls onSearch with an empty string for whitespace-only input", async () => {
      // Documents current behavior: the caller decides whether "" should search
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(<ControlledSearchbar onSearch={onSearch} />);

      await user.type(getInput(), "   {Enter}");

      expect(onSearch).toHaveBeenCalledWith("");
    });

    it("can be submitted by an external button via the form attribute", async () => {
      const user = userEvent.setup();
      const onSearch = vi.fn();
      render(
        <>
          <ControlledSearchbar
            id="external-search"
            initialValue="copd"
            onSearch={onSearch}
          />
          <button type="submit" form="external-search">
            Go
          </button>
        </>,
      );

      await user.click(screen.getByRole("button", { name: "Go" }));

      expect(onSearch).toHaveBeenCalledWith("copd");
    });

    it("prevents the native form submission (no page reload)", () => {
      renderStatic({ value: "x", onSearch: vi.fn() });

      // fireEvent returns false when preventDefault() was called
      const notPrevented = fireEvent.submit(screen.getByRole("search"));

      expect(notPrevented).toBe(false);
    });

    it("does not throw when onSearch is not provided", async () => {
      const user = userEvent.setup();
      render(<ControlledSearchbar />);

      await expect(
        user.type(getInput(), "asthma{Enter}"),
      ).resolves.not.toThrow();
    });

    it("does not throw when onSelect is not provided", async () => {
      const user = userEvent.setup();
      render(<ControlledSearchbar options={OPTIONS} />);

      await user.type(getInput(), "ast");
      await user.click(screen.getByRole("option", { name: /^asthma/ }));

      expect(getInput()).toHaveValue("asthma");
    });
  });

  describe("disabled", () => {
    it("disables the input", () => {
      renderStatic({ disabled: true });
      expect(getInput()).toBeDisabled();
    });

    it("does not call onChange, onSearch or onSelect when disabled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onSearch = vi.fn();
      const onSelect = vi.fn();
      render(
        <ControlledSearchbar
          disabled
          options={OPTIONS}
          onChange={onChange}
          onSearch={onSearch}
          onSelect={onSelect}
        />,
      );

      await user.type(getInput(), "asthma{Enter}");

      expect(onChange).not.toHaveBeenCalled();
      expect(onSearch).not.toHaveBeenCalled();
      expect(onSelect).not.toHaveBeenCalled();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("inputProps", () => {
    it("passes extra attributes to the underlying input", () => {
      renderStatic({ inputProps: { maxLength: 50, "data-testid": "q" } });
      const input = screen.getByTestId("q");
      expect(input).toBe(getInput());
      expect(input).toHaveAttribute("maxlength", "50");
    });

    it("lets inputProps override the aria label", () => {
      // inputProps is spread after aria-label, so it wins
      renderStatic({ inputProps: { "aria-label": "Find a concept" } });
      expect(
        screen.getByRole("combobox", { name: "Find a concept" }),
      ).toBeInTheDocument();
    });

    it("keeps the autocomplete wiring when inputProps are passed", async () => {
      const user = userEvent.setup();
      render(
        <ControlledSearchbar
          options={OPTIONS}
          inputProps={{ maxLength: 50 }}
        />,
      );

      await user.type(getInput(), "ast");

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });
});

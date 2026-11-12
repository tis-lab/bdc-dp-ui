import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AlertColor } from "@mui/material";
import Notification from "./Notification";
import type { ComponentProps } from "react";

const AUTO_HIDE_MS = 5000;

type NotificationProps = ComponentProps<typeof Notification>;

function renderNotification(props: Partial<NotificationProps> = {}) {
  return render(
    <Notification
      open
      severity="error"
      message="Network down"
      onClose={jest.fn()}
      {...props}
    />,
  );
}

const queryCloseButton = () => screen.queryByRole("button", { name: "Close" });

describe("Notification", () => {
  describe("rendering", () => {
    it("renders nothing when closed", () => {
      renderNotification({ open: false });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows the message in an alert when open", () => {
      renderNotification({ message: "Concept added" });
      expect(screen.getByRole("alert")).toHaveTextContent("Concept added");
    });

    it("renders an empty alert when no message is given", () => {
      renderNotification({ message: undefined });
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it.each<AlertColor>(["success", "info", "warning", "error"])(
      "applies the %s severity",
      (severity) => {
        renderNotification({ severity });
        const cap = severity[0].toUpperCase() + severity.slice(1);
        expect(screen.getByRole("alert")).toHaveClass(`MuiAlert-color${cap}`);
      },
    );

    it("shows a close button when onClose is provided", () => {
      renderNotification({ onClose: jest.fn() });
      expect(queryCloseButton()).toBeInTheDocument();
    });
  });

  describe("placement", () => {
    // Rendered in place, the Snackbar became a sibling in its parent's
    // Stack and pushed the next element down by the Stack's spacing
    it("renders outside its parent, so it never shifts the layout around it", () => {
      render(
        <div data-testid="parent">
          <Notification
            open
            severity="error"
            message="Network down"
            onClose={jest.fn()}
          />
        </div>,
      );

      expect(screen.getByRole("alert")).toHaveTextContent("Network down");
      expect(screen.getByTestId("parent")).toBeEmptyDOMElement();
    });

    it("leaves its parent empty while closed, too", () => {
      render(
        <div data-testid="parent">
          <Notification open={false} severity="error" onClose={jest.fn()} />
        </div>,
      );

      expect(screen.getByTestId("parent")).toBeEmptyDOMElement();
    });
  });

  describe("closing", () => {
    it("calls onClose when the close button is clicked", async () => {
      const onClose = jest.fn();
      const user = userEvent.setup();
      renderNotification({ onClose });

      await user.click(screen.getByRole("button", { name: /close/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("ignores clicks outside the notification", async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(
        <>
          <button>Outside</button>
          <Notification
            open
            severity="error"
            message="Network down"
            onClose={onClose}
          />
        </>,
      );
      // MUI only starts listening for clickaways on the next tick,
      // so the click that opened it doesn't immediately close it
      await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

      await user.click(screen.getByRole("button", { name: "Outside" }));

      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("auto-hide", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("calls onClose after 5 seconds, not before", () => {
      const onClose = jest.fn();
      renderNotification({ onClose });

      act(() => jest.advanceTimersByTime(AUTO_HIDE_MS - 1));
      expect(onClose).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(1));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("does not call onClose while closed", () => {
      const onClose = jest.fn();
      renderNotification({ open: false, onClose });

      act(() => jest.advanceTimersByTime(AUTO_HIDE_MS * 2));

      expect(onClose).not.toHaveBeenCalled();
    });

    it("restarts the timer when reopened", () => {
      const onClose = jest.fn();
      const { rerender } = renderNotification({ onClose });
      act(() => jest.advanceTimersByTime(3000));

      // Close and reopen partway through
      rerender(
        <Notification
          open={false}
          severity="error"
          message="Network down"
          onClose={onClose}
        />,
      );
      rerender(
        <Notification
          open
          severity="error"
          message="Network down"
          onClose={onClose}
        />,
      );

      // 3s + 3s would have hit 5s on the old timer
      act(() => jest.advanceTimersByTime(3000));
      expect(onClose).not.toHaveBeenCalled();

      act(() => jest.advanceTimersByTime(2000));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});

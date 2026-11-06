import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, AlertTitle, Button } from "@mui/material";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Contains render errors so they do not unmount the host page. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={this.reset}>
            Try again
          </Button>
        }
      >
        <AlertTitle>Something went wrong.</AlertTitle>
        We couldn't display the Cohort Builder. Please try again.
      </Alert>
    );
  }
}

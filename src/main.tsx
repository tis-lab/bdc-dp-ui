import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material";
import Root from "./Root";

import theme from "./theme/MuiTheme";
/**
 * For migrating to other environment, remove above line and add this line:
 * import { muiTheme as theme } from "@nhlbi/bdcp-frontend"
 */

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <Root />
    </ThemeProvider>
  </StrictMode>,
);

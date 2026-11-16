import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router";
import Root from "./Root";

import theme from "./theme/MuiTheme";
/**
 * For migrating to other environment, remove above line and add this line:
 * import { muiTheme as theme } from "@nhlbi/bdcp-frontend"
 */

import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/public-sans/700.css";
import "@fontsource/merriweather/400.css";
import "@fontsource/merriweather/600.css";
import "@fontsource/merriweather/700.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);

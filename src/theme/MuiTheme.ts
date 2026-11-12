import { createTheme } from "@mui/material/styles";
import styling, { codeFont, colors } from "./Styling";

const theme = createTheme({
  palette: {
    primary: {
      main: styling.primaryPalette.nhlbiNavy.value,
      contrastText: styling.primaryPalette.white.value,
    },
    secondary: {
      main: styling.secondaryPalette.teal.value,
      contrastText: styling.primaryPalette.white.value,
    },
    background: {
      main: styling.primaryPalette.lightGray.value,
      default: styling.secondaryPalette.backgroundGrayCatalystDark.value,
      active: styling.secondaryPalette.darkBlue.value,
      icon: styling.secondaryPalette.paleTeal.value,
      paper: styling.primaryPalette.white.value,
    },
    text: {
      primary: styling.primaryPalette.nhlbiDarkGray.value,
      secondary: styling.secondaryPalette.textBlack.value,
    },
    landing: {
      header: styling.primaryPalette.nhlbiDarkNavy.value,
      default: styling.primaryPalette.nhlbiMediumNavy.value,
      eyebrow: styling.primaryPalette.nhlbiNavy.value,
      border: styling.secondaryPalette.lightGray.value,
    },
    catalog: {
      border: styling.secondaryPalette.borderGray.value,
    },
  },
  typography: {
    fontFamily: styling.typography.fontFamily,
    h1: { ...styling.typography.h1 },
    h2: { ...styling.typography.h2 },
    h3: { ...styling.typography.h3 },
    h4: { ...styling.typography.h4 },
    h5: { ...styling.typography.h5 },
    body1: { ...styling.typography.body1 },
    body2: { ...styling.typography.body2 },
    caption: { ...styling.typography.caption },
    eyebrow: { ...styling.typography.eyebrow },
  },
  layout: {
    footer: {
      primary: {
        color: "#dfe1e2",
        backgroundColor: "#3d4551",
        p: 0,
      },
      identifier: {
        color: "#a9aeb1",
        backgroundColor: "#1b1b1b",
        pb: 2,
        m: 0,
      },
      colors: {
        border: "#565c65",
        header: "#f0f0f0",
        text1: "#dfe1e2",
        text2: "#a9aeb1",
      },
    },
    landing: {
      sx: {
        background:
          "radial-gradient(circle at 8% 14%, rgba(0, 94, 162, .2) 0%, transparent 36%), radial-gradient(circle at 90% 18%, rgba(0, 129, 161, .16) 0%, transparent 34%), linear-gradient(180deg, #0081a10f, #fffdf9 52%, #005ea214)",
      },
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        position: "static",
        color: "default",
        elevation: 1,
      },
      styleOverrides: {
        root: {
          backgroundColor: styling.primaryPalette.white.value,
          borderBottom: `1px solid ${styling.secondaryPalette.lightGray.value}`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: { justifyContent: "space-between" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: "9999px",
          fontSize: "15px",
          fontWeight: 500,
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        code: {
          fontFamily: codeFont,
          fontSize: "18px",
        },
        "pre, code, kbd, samp": {
          fontFamily: codeFont,
        },
        // Global anchor styles: default teal + underline
        a: {
          color: styling.primaryPalette.nhlbiTeal.value,
          textDecoration: "underline",
          "&:hover": { textDecoration: "underline" },
        },

        ":root": {
          "--ag-font-family": styling.typography.fontFamily,
          "--ag-font-size": "17px",
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: "always",
        color: "primary",
      },
      styleOverrides: {
        root: {
          color: styling.primaryPalette.nhlbiTeal.value,
          textDecoration: "underline",
          "&.subtle": {
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          },
        },
      },
    },
    MuiTooltip: {
      // Ensure a consistent 500ms delay for first hover and subsequent hovers (enterNextDelay)
      defaultProps: {
        enterDelay: 500,
        enterNextDelay: 500,
        leaveDelay: 200,
        arrow: true,
        placement: "top",
      },
    },
  },
});

export const menuButtonBaseStyles = {
  ...styling.typography.menuitem,
  borderRadius: 0,
  borderBottom: `4px solid transparent`,
  color: colors.menu.textColor,
  px: 1.5,
  py: 1.25,
  "&:hover": {
    color: colors.menu.hoverText,
    backgroundColor: "transparent",
    borderBottom: `5px solid ${colors.menu.hoverBackground}`,
  },
  "&:focus": {
    color: "white",
    backgroundColor: colors.menu.hoverBackground,
    borderBottomColor: colors.menu.hoverBackground,
  },
};

export const heroButtonStyles = {
  color: "white",
  fontSize: ".9rem",
  fontWeight: 700,
  ml: 2,
  px: 2,
  py: 1,
  textTransform: "uppercase",
  background: styling.primaryPalette.nhlbiRed.value,
  border: "none",
  cursor: "pointer",
  boxShadow: "inset 0 0 0 0 #000000",
  "&:hover": {
    boxShadow: "inset 0 0 0 0 #000000",
    backgroundColor: "#a82332",
  },
  "&:active": {
    boxShadow: "inset 0 0 0 2px #7a1a24",
    backgroundColor: "#8f1f2c",
  },
  "&.Mui-disabled": { opacity: 0.5 },
};

export default theme;

const FAMILY_FONT_1 =
  "Merriweather, Georgia, Cambria, Times New Roman, Times, serif;";
const FAMILY_FONT_2 =
  "Public Sans, -apple-system, BlinkMacSystemFont, Segoe UI,  Roboto,  Helvetica,  Arial,  sans-serif,  Apple Color Emoji,  Segoe UI Emoji,  Segoe UI Symbol";

const styling = {
  primaryPalette: {
    nhlbiNavy: {
      value: "#005ea2",
      description: "Bright Navy Blue - used in the menubar background",
    },
    nhlbiDarkNavy: {
      value: "#162e51",
      description: "Navy Blue — used for header text",
    },
    nhlbiMediumNavy: {
      value: "#274863",
      description: "Navy Medium Blue — used for paragraph text in landing page",
    },
    lightGray: {
      value: "#f3f3f5",
      description: "Light gray used for background color in catalog page",
    },
    white: {
      value: "#FFFFFF",
      description: "Hero Title, Main Background color",
    },
    nhlbiDarkGray: {
      value: "#222222",
      description: "H1, H2, H3, paragraph, subtitle text",
    },
    nhlbiTeal: {
      value: "#007b8a",
      description: "Teal — Primary buttons, active states, links",
    },
    nhlbiRed: {
      value: "#cd425b",
      description: "Red — Hero buttons",
    },
  },
  secondaryPalette: {
    teal: {
      value: "#0081a1",
      description: "Darker teal color for icons",
    },
    paleTeal: {
      value: "#e7f6f8",
      description:
        "Pale teal color - used for background color for teal color icons",
    },
    darkBlue: {
      value: "#14284B",
      description: "Dark Blue - used in the menubar background",
    },
    backgroundGrayCatalystDark: {
      value: "#f4f4f6",
      description:
        "Used in header, footer, sidebar and light gray blocks on homepage",
    },
    textBlack: {
      value: "#393939",
      description: "Used for black text on white and dark boxes on homepage",
    },
    lightGray: {
      value: "#dfe1e2",
      description: "Light gray color used for border color or backgrounds",
    },
    borderGray: {
      value: "#e5e7eb",
      description: "Light gray color used for border color",
    },
  },
  typography: {
    fontFamily: FAMILY_FONT_2,
    h1: {
      fontFamily: FAMILY_FONT_1,
      fontWeight: 700,
      fontSize: "36px",
      lineHeight: 1.2,
      letterSpacing: "0.3px",
    },
    h2: {
      //unused
      fontFamily: FAMILY_FONT_1,
      fontWeight: 700,
      fontSize: "1.95rem",
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: FAMILY_FONT_1,
      fontWeight: 700,
      fontSize: "2rem",
      lineHeight: 1.4,
    },
    h4: {
      //unused
      fontFamily: FAMILY_FONT_1,
      fontWeight: 700,
      fontSize: "1.25rem",
      lineHeight: 1.4,
    },
    h5: {
      fontFamily: FAMILY_FONT_2,
      fontWeight: 700,
      fontSize: "14px",
      lineHeight: 1.4,
    },
    eyebrow: {
      fontFamily: FAMILY_FONT_2,
      fontWeight: 700,
      fontSize: "14px",
    },
    body1: {
      fontFamily: FAMILY_FONT_2,
      fontWeight: 400,
      fontSize: "16px",
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: FAMILY_FONT_2,
      fontWeight: 400,
      fontSize: "14px",
      lineHeight: 1.5,
    },
    caption: {
      fontFamily: FAMILY_FONT_2,
      fontWeight: 400,
      fontSize: "12px",
      lineHeight: 1.4,
    },
    menuitem: {
      fontFamily: FAMILY_FONT_2,
      fontWeight: 600,
      fontSize: ".88rem",
    },
    label: {
      fontFamily: FAMILY_FONT_2,
      fontWeight: 400,
      fontSize: "14px",
      color: "textBlack",
    },
  },
  layout: {
    tableHeight: "650px",
    tableMargin: "2px",
  },
};

export const colors = {
  primary: {
    white: "#FFFFFF",
  },
  border: {
    highlight: "#0081a1",
  },
  barchart: {
    primary: "#0081a1",
    secondary: "#a3a3a5",
  },
  menu: {
    textColor: "#565c65",
    hoverText: "#005ea2",
    hoverBackground: "#162e51",
  },
  alert: {
    text: "#717182",
    error: "#cd425b",
    warning: "#f4a91f",
    info: "#0081a1",
  },
  links: {
    default: {
      color: "#007b8a",
      textDecoration: "underline",
    },
    subtle: {
      color: "#007b8a",
      textDecoration: "none",
      "&:hover": { textDecoration: "underline" },
    },
  },
  agGrid: {
    /* Force opaque backgrounds for tooltips/popups inside AG Grid for visibility*/
    menuBackground: "#ffffff",
    tooltipBackground: "#333333",
    tooltipText: "#ffffff",
  },
};

// monospace token for code/data display
export const codeFont = "Monaco, Consolas, monospace";

export default styling;

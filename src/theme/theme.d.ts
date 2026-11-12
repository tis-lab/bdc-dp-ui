import "@mui/material/styles";
import "@mui/material/Typography";
import type { CSSProperties } from "react";
import type { SxProps } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface TypeBackground {
    main: string;
    active: string;
    icon: string;
  }

  interface Palette {
    landing: {
      header: string;
      default: string;
      eyebrow: string;
      border: string;
    };
    catalog: { border: string };
  }
  interface PaletteOptions {
    landing?: Partial<Palette["landing"]>;
    catalog?: Partial<Palette["catalog"]>;
  }

  interface TypographyVariants {
    eyebrow: CSSProperties;
  }
  interface TypographyVariantsOptions {
    eyebrow?: CSSProperties;
  }

  interface LayoutTokens {
    footer: {
      primary: Record<string, string | number>;
      identifier: Record<string, string | number>;
      colors: { border: string; header: string; text1: string; text2: string };
    };
    landing: { sx: SxProps<Theme> };
  }

  interface Theme {
    layout: LayoutTokens;
  }
  interface ThemeOptions {
    layout?: Partial<LayoutTokens>;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    eyebrow: true;
  }
}

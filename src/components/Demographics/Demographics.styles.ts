import { styled } from "@mui/material";

const ROW_HEIGHT = 40;

/** Grows with the number of categories, one bar per row. */
export const BarArea = styled("div", {
  shouldForwardProp: (prop) => prop !== "rows",
})<{ rows: number }>(({ rows }) => ({
  height: rows * ROW_HEIGHT,
}));

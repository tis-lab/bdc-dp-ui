import { Chip, styled, Typography } from "@mui/material";

// ----------------------------------------------------------------------

export const DetailsRoot = styled("dl", {
  name: "CohortConceptCard",
  slot: "Details",
})(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(1.5),
  // display: "grid",
  gap: theme.spacing(1),
  ...theme.typography.body2,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.action.hover,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  display: "flex",
  flexWrap: "wrap",
  columnGap: theme.spacing(4),
  rowGap: theme.spacing(1.5),
}));

// ----------------------------------------------------------------------

/* DetailField */

export const DetailFieldRoot = styled("div", {
  shouldForwardProp: (prop) => prop !== "fullWidth",
})<{ fullWidth?: boolean }>(({ fullWidth }) => ({
  flexBasis: fullWidth ? "100%" : "auto",
  minWidth: 0,
}));

export const DetailTerm = styled(Typography)({
  lineHeight: 1.4,
}) as typeof Typography;

export const DetailValue = styled("dd")(({ theme }) => ({
  ...theme.typography.body2,
  margin: 0,
  marginTop: theme.spacing(0.25),
  fontWeight: theme.typography.fontWeightMedium,
  overflowWrap: "anywhere",
}));

// ----------------------------------------------------------------------

/* CategoryValue */

export const CategoryRoot = styled("span")(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexWrap: "wrap",
}));

export const SourceChip = styled(Chip)(({ theme }) => ({
  height: 20,
  fontSize: "0.6875rem",
  fontWeight: theme.typography.fontWeightMedium,
  color: theme.palette.text.secondary,
}));

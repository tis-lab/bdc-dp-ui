import { Button, Card, CardContent, styled, Typography } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";

interface ConceptCardRootProps {
  isFirst: boolean;
  isLast: boolean;
}

export const ConceptCardRoot = styled(Card, {
  name: "CohortConceptCard",
  slot: "Root",
  shouldForwardProp: (prop) => prop !== "isFirst" && prop !== "isLast",
})<ConceptCardRootProps>(({ isFirst, isLast }) => ({
  // Outer corners inherit the theme's Card radius; only flatten inner corners
  ...(!isFirst && {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTop: "none", // adjacent cards share a single line
  }),
  ...(!isLast && {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  }),
}));

export const ConceptCardBody = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  // CardContent adds extra bottom padding to its last child by default
  "&:last-child": {
    paddingBottom: theme.spacing(2),
  },
}));

export const ConceptCardLayout = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  flexWrap: "wrap",
  [theme.breakpoints.up("sm")]: {
    flexWrap: "nowrap",
  },
}));

export const ConceptCardMain = styled("div")({
  minWidth: 0,
  width: "100%",
});

export const ConceptTitle = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
})) as typeof Typography;

export const DetailsButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(-1),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  "& .MuiButton-startIcon": {
    marginRight: theme.spacing(0.5),
  },
}));

export const ExpandIcon = styled(ChevronRight, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
  transform: open ? "rotate(90deg)" : "none",
}));

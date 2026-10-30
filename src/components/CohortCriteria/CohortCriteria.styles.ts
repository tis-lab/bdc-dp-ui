import {
  Card,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  styled,
} from "@mui/material";
import { Panel } from "../Panel/Panel.styles";

export const CriteriaPanel = styled(Panel)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
}));

export const Header = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(1),
}));

/** Include and Exclude side by side; stacked on small screens. */
export const Sections = styled("div")(({ theme }) => ({
  display: "grid",
  gap: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "1fr 1fr",
  },
}));

export const MatchCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
}));

export const MatchLabel = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
})) as typeof Typography;

export const MatchTitle = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
})) as typeof Typography;

export const MatchToggleGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
  "& .MuiToggleButton-root": {
    border: 0,
    borderRadius: theme.shape.borderRadius,
  },
  "& .MuiToggleButton-root.Mui-selected": {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
  },
}));

export const MatchToggle = styled(ToggleButton)(({ theme }) => ({
  gap: theme.spacing(1),
  textTransform: "none",
  fontWeight: theme.typography.fontWeightBold,
}));

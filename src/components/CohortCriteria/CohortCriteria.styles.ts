import { ToggleButton, styled } from "@mui/material";
import { Panel } from "../Panel/Panel.styles";

export const CriteriaPanel = styled(Panel)(({ theme }) => ({
  backgroundColor: theme.palette.grey[50],
}));

export const Header = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(1),
}));

export const Sections = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));

export const MatchRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));

export const MatchToggle = styled(ToggleButton)(({ theme }) => ({
  textTransform: "none",
  color: theme.palette.text.primary,
  "&.Mui-selected, &.Mui-selected:hover": {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  "&.Mui-focusVisible": {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}));

import { Stack, styled } from "@mui/material";

export const CriteriaSectionRoot = styled("section")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
  minWidth: 0,
}));

export const SectionHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const CriteriaList = styled(Stack)(({ theme }) => ({
  width: "100%",
  "& .MuiIconButton-root:hover, & .MuiIconButton-root.Mui-focusVisible": {
    color: theme.palette.error.main,
  },
}));

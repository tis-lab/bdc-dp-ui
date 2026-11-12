import { Button, styled } from "@mui/material";

// ----------------------------------------------------------------------

/** Search input and button side by side. */
export const SearchRow = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
}));

/** Keeps the button at its natural width when the input grows. */
export const SearchButton = styled(Button)({
  flexShrink: 0,
});

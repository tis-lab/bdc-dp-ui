import { Chip, Popover, Typography } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

// ----------------------------------------------------------------------

export const PopoverRoot = styled(Popover)(({ theme }) => {
  const radius = theme.shape.borderRadius;

  return {
    "& .MuiPopover-paper": {
      marginTop: theme.spacing(1),
      padding: theme.spacing(2),
      maxWidth: 400,
      borderRadius:
        typeof radius === "number" ? radius * 2 : `calc(${radius} * 2)`,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: theme.shadows[4],
    },
  };
});

export const PopoverHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
}));

// Cast keeps the `component` prop typed on the styled Typography.
export const PopoverTitle = styled(Typography)({
  fontWeight: 700,
}) as typeof Typography;

export const VariableChip = styled(Chip)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
}));

export const PopoverBody = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
}));

export const PopoverActions = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: theme.spacing(2),
}));

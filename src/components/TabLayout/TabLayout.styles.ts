import { Box, styled } from "@mui/material";

export const TabLayout = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

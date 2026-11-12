import { Box, Container, Grid, styled } from "@mui/material";

export const Hero = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.main,
}));

export const GridContainer = styled(Grid)(({ theme }) => ({
  paddingTop: theme.spacing(7),
  paddingBottom: theme.spacing(7),
}));

export const HeroText = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

export const MainSection = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
}));

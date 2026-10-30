import { Typography, styled } from "@mui/material";

export const DONUT_SIZE = 170;

export const Donut = styled("div")({
  position: "relative",
  height: DONUT_SIZE,
});

export const DonutCenter = styled("div")({
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
});

export const DonutCaption = styled(Typography)({
  maxWidth: 140,
  textAlign: "center",
});

export const SnapshotFooter = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(0.5),
  textAlign: "center",
}));

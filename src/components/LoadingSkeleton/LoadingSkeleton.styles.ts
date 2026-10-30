import { Skeleton, styled } from "@mui/material";

/** Lighter than the Skeleton default, to match the tinted empty states. */
export const MutedSkeleton = styled(Skeleton)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
}));

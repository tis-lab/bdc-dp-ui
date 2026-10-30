import { Stack } from "@mui/material";
import { MutedSkeleton } from "./LoadingSkeleton.styles";

// ----------------------------------------------------------------------

export interface Props {
  count: number;
  height: number;
  /** Announced to screen readers while loading. */
  label: string;
}

// ----------------------------------------------------------------------

/**
 * Placeholder rows shaped like the content they stand in for, so the layout
 * doesn't jump when it lands. Spread evenly when the parent has a fixed height.
 */
export default function SkeletonRows({ count, height, label }: Props) {
  return (
    <Stack
      spacing={1}
      height="100%"
      justifyContent="space-around"
      role="progressbar"
      aria-label={label}
    >
      {Array.from({ length: count }, (_, i) => (
        <MutedSkeleton key={i} variant="rounded" height={height} />
      ))}
    </Stack>
  );
}

import { Box, Typography } from "@mui/material";
import { useId } from "react";

interface Props {
  id?: string;
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle, id }: Props) {
  const fallbackId = useId();

  return (
    <Box>
      <Typography variant="h1" textAlign="center" id={id ?? fallbackId}>
        {title}
      </Typography>
      {subtitle && (
        <Typography
          component="p"
          variant="subtitle1"
          textAlign="center"
          color="text.secondary"
          gutterBottom
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

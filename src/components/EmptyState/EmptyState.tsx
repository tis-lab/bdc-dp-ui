import type { ReactNode } from "react";
import { Typography } from "@mui/material";
import { EmptyStateRoot, EmptyStateText } from "./EmptyState.styles";

export interface Props {
  icon?: ReactNode;
  title?: string;
  description: string;
  align?: "center" | "start";
  children?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  align = "center",
  children,
}: Props) {
  return (
    <EmptyStateRoot align={align}>
      {icon}
      <EmptyStateText align={align}>
        {title && (
          <Typography component="p" variant="subtitle1">
            {title}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        {children}
      </EmptyStateText>
    </EmptyStateRoot>
  );
}

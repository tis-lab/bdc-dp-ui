import { useId, type ReactNode } from "react";
import { Chip, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ConceptCard from "../ConceptCard";
import {
  getSearchItemKey,
  type SearchItem,
} from "../../api/graphql/queries/resolveTerms";
import {
  CriteriaList,
  CriteriaSectionRoot,
  SectionHeader,
} from "./CriteriaSection.styles";

// ----------------------------------------------------------------------

export interface Props {
  title: string;
  emptyText: string;
  items: SearchItem[];
  onRemove: (item: SearchItem) => void;
  /** Controls for this section, shown under its header. */
  children?: ReactNode;
}

// ----------------------------------------------------------------------

export default function CriteriaSection({
  title,
  emptyText,
  items,
  onRemove,
  children,
}: Props) {
  const titleId = useId();
  const actions = [
    {
      label: "Remove",
      icon: <DeleteOutlineIcon fontSize="small" />,
      onClick: onRemove,
    },
  ];

  return (
    <CriteriaSectionRoot aria-labelledby={titleId}>
      <SectionHeader>
        <Typography id={titleId} component="h3" variant="overline">
          {title}
        </Typography>
        <Chip label={items.length} size="small" />
      </SectionHeader>

      {children}

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {emptyText}
        </Typography>
      ) : (
        <CriteriaList>
          {items.map((item, i) => (
            <ConceptCard
              key={getSearchItemKey(item)}
              concept={item}
              isFirst={i === 0}
              isLast={i === items.length - 1}
              actions={actions}
              compact
            />
          ))}
        </CriteriaList>
      )}
    </CriteriaSectionRoot>
  );
}

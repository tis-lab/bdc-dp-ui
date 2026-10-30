import { useId } from "react";
import { Chip, Typography } from "@mui/material";
import ConceptCard from "../ConceptCard";
import EmptyState from "../EmptyState";
import {
  getSearchItemKey,
  type SearchItem,
} from "../../api/graphql/queries/resolveTerms";
import {
  CriteriaList,
  CriteriaSectionRoot,
  EmptyListCard,
  SectionHeader,
} from "./CriteriaSection.styles";

// ----------------------------------------------------------------------

export interface Props {
  title: string;
  emptyText: string;
  items: SearchItem[];
  onRemove: (item: SearchItem) => void;
}

// ----------------------------------------------------------------------

export default function CriteriaSection({
  title,
  emptyText,
  items,
  onRemove,
}: Props) {
  const titleId = useId();
  const actions = [{ label: "Remove", onClick: onRemove }];

  return (
    <CriteriaSectionRoot aria-labelledby={titleId}>
      <SectionHeader>
        <Typography id={titleId} component="h3" variant="overline">
          {title}
        </Typography>
        <Chip label={items.length} size="small" />
      </SectionHeader>

      {items.length === 0 ? (
        <EmptyListCard variant="outlined">
          <EmptyState description={emptyText} />
        </EmptyListCard>
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

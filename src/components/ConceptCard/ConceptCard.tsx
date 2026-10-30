import { useId, useState } from "react";
import { Button, Chip, Collapse, Stack, Typography } from "@mui/material";
import { SearchItem } from "../../api/graphql/queries/resolveTerms";
import ConceptCardDetails from "./ConceptCardDetails";
import {
  ConceptCardBody,
  ConceptCardLayout,
  ConceptCardMain,
  ConceptCardRoot,
  ConceptTitle,
  DetailsButton,
  ExpandIcon,
} from "./ConceptCard.styles";

function formatDomain(domain: string): string {
  return domain
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

// ----------------------------------------------------------------------

/* Prop Types */
export interface ConceptAction {
  label: string;
  onClick: (concept: SearchItem) => void;
  /** Shown filled, as a pressed toggle. */
  selected?: boolean;
}

export interface Props {
  concept: SearchItem;
  isFirst: boolean;
  isLast: boolean;
  actions?: ConceptAction[];
  /** Name and code only, for concepts already picked. */
  compact?: boolean;
}

/* Normalizes both search item types into the fields the card renders. */
interface CardView {
  id: string;
  label: string;
  category: string | null;
  description: string | null;
  isHarmonizedVariable: boolean;
  variableNames: string[];
}

function toCardView(item: SearchItem): CardView {
  if (item.__typename === "BdcVariable") {
    return {
      id: item.name,
      label: item.label,
      category: item.domain ? formatDomain(item.domain) : null,
      description: null,
      isHarmonizedVariable: true,
      variableNames: [],
    };
  }

  return {
    id: item.id,
    label: item.label,
    category: item.category,
    description: item.description,
    isHarmonizedVariable: false,
    variableNames: item.bdc.variableNames,
  };
}

// ----------------------------------------------------------------------

export default function ConceptCard({
  concept,
  isFirst,
  isLast,
  actions = [],
  compact = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const view = toCardView(concept);

  return (
    <ConceptCardRoot variant="outlined" isFirst={isFirst} isLast={isLast}>
      <ConceptCardBody>
        <ConceptCardLayout>
          <ConceptCardMain>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              {compact ? (
                <Typography component="h2" variant="body2">
                  {view.label}
                </Typography>
              ) : (
                <ConceptTitle component="h2" variant="subtitle2">
                  {view.label}
                </ConceptTitle>
              )}

              {!compact && view.isHarmonizedVariable && (
                <Chip
                  label="Harmonized Variable"
                  size="small"
                  color="success"
                />
              )}
            </Stack>

            <Typography component="p" variant="caption" color="text.secondary">
              {view.id} {/*· x studies */}
            </Typography>

            {!compact && (
              <>
                <DetailsButton
                  size="small"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  aria-controls={detailsId}
                  startIcon={<ExpandIcon open={open} />}
                >
                  Details
                </DetailsButton>

                <Collapse in={open} id={detailsId} unmountOnExit>
                  <ConceptCardDetails
                    category={view.category ?? undefined}
                    description={view.description}
                    variableNames={view.variableNames}
                  />
                </Collapse>
              </>
            )}
          </ConceptCardMain>

          <Stack direction="row" spacing={1} flexShrink={0}>
            {actions.map((a) => (
              <Button
                key={a.label}
                variant={a.selected ? "contained" : "outlined"}
                size="small"
                aria-pressed={a.selected}
                onClick={() => a.onClick(concept)}
              >
                {a.label}
              </Button>
            ))}
          </Stack>
        </ConceptCardLayout>
      </ConceptCardBody>
    </ConceptCardRoot>
  );
}

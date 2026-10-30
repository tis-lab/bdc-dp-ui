import { useId } from "react";
import { Alert, Card, Chip, Typography } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CriteriaSection from "../CriteriaSection";
import EmptyState from "../EmptyState";
import { PanelTitle } from "../Panel/Panel.styles";
import type { SearchItem } from "../../api/graphql/queries/resolveTerms";
import type {
  Criteria,
  CriteriaKind,
  CriteriaMatch,
} from "../../hooks/useCohortSummary";
import {
  CriteriaPanel,
  Header,
  MatchCard,
  MatchLabel,
  MatchTitle,
  MatchToggle,
  MatchToggleGroup,
  Sections,
} from "./CohortCriteria.styles";

const MATCH_TEXT: Record<
  CriteriaMatch,
  { title: string; description: string }
> = {
  all: {
    title: "Match all criteria",
    description: "Participants must meet every inclusion criterion.",
  },
  any: {
    title: "Match at least one criterion",
    description: "Participants can meet any one of the inclusion criteria.",
  },
};

// ----------------------------------------------------------------------

export interface Props {
  criteria: Criteria;
  onRemove: (kind: CriteriaKind) => (item: SearchItem) => void;
  onMatchChange: (match: CriteriaMatch) => void;
}

// ----------------------------------------------------------------------

export default function CohortCriteria({
  criteria,
  onRemove,
  onMatchChange,
}: Props) {
  const titleId = useId();
  const total = criteria.include.length + criteria.exclude.length;

  return (
    <CriteriaPanel as="section" aria-labelledby={titleId}>
      <Header>
        <div>
          <PanelTitle id={titleId}>Cohort Criteria</PanelTitle>
          <Typography variant="body2" color="text.secondary">
            Define who should and should not be part of this cohort.
          </Typography>
        </div>
        <Chip
          label={`${total} ${total === 1 ? "criterion" : "criteria"}`}
          size="small"
        />
      </Header>

      {total === 0 ? (
        <Card variant="outlined">
          <EmptyState
            align="start"
            icon={<FilterListIcon color="action" />}
            title="No criteria added yet"
            description="Search above, then add a concept as Include or Exclude."
          />
        </Card>
      ) : (
        <>
          {criteria.include.length > 1 && (
            <>
              <MatchCard variant="outlined">
                <div>
                  <MatchLabel
                    variant="overline"
                    color="text.secondary"
                    component="p"
                  >
                    Inclusion logic
                  </MatchLabel>
                  <MatchTitle variant="subtitle1" component="p">
                    {MATCH_TEXT[criteria.match].title}
                  </MatchTitle>
                  <Typography variant="body2" color="text.secondary">
                    {MATCH_TEXT[criteria.match].description}
                  </Typography>
                </div>
                <MatchToggleGroup
                  exclusive
                  value={criteria.match}
                  onChange={(_, match: CriteriaMatch | null) =>
                    match && onMatchChange(match)
                  }
                  aria-label="Inclusion logic"
                >
                  <MatchToggle value="all">
                    All criteria
                    <Typography variant="overline" color="text.secondary">
                      AND
                    </Typography>
                  </MatchToggle>
                  <MatchToggle value="any">
                    Any criterion
                    <Typography variant="overline" color="text.secondary">
                      OR
                    </Typography>
                  </MatchToggle>
                </MatchToggleGroup>
              </MatchCard>
              <Alert severity="info">
                Counts are illustrative until the summary API supports AND/OR.
              </Alert>
            </>
          )}
          <Sections>
            <CriteriaSection
              title="Include"
              emptyText="No inclusion criteria added"
              items={criteria.include}
              onRemove={onRemove("include")}
            />
            <CriteriaSection
              title="Exclude"
              emptyText="No exclusion criteria added"
              items={criteria.exclude}
              onRemove={onRemove("exclude")}
            />
          </Sections>
        </>
      )}
    </CriteriaPanel>
  );
}
